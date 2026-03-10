package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.CreateBatchRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductVariantRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductRequest;
import com.foodrescue.foodrescue_be.dto.request.UpdateProductRequest;
import com.foodrescue.foodrescue_be.dto.response.InventoryBatchResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductImageResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductVariantResponse;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import com.foodrescue.foodrescue_be.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SellerRepository sellerRepository;
    private final ProductImageRepository imageRepository;
    private final InventoryBatchRepository batchRepository;

    @Override
    public Page<ProductResponse> getPublicProducts(Long categoryId, String keyword, Pageable pageable) {
        return productRepository.searchPublic(categoryId, null, keyword, pageable)
                .map(this::toResponse);
    }

    @Override
    public ProductResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        return toResponse(product);
    }

    @Override
    public Page<ProductResponse> getSellerProducts(Long sellerId, String keyword, Pageable pageable) {
        return productRepository.findBySeller(sellerId, keyword, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(Long sellerId, CreateProductRequest req) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại"));

        Brand brand = null;
        if (req.getBrandId() != null) {
            brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new IllegalArgumentException("Thương hiệu không tồn tại"));
        }

        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .brand(brand)
                .productCode(req.getProductCode())
                .name(req.getName())
                .slug(req.getSlug())
                .shortDescription(req.getShortDescription())
                .description(req.getDescription())
                .productType(parseEnum(Product.ProductType.class, req.getProductType(), Product.ProductType.other))
                .sellMode(parseEnum(Product.SellMode.class, req.getSellMode(), Product.SellMode.by_unit))
                .storageType(parseEnum(Product.StorageType.class, req.getStorageType(), Product.StorageType.ambient))
                .originCountry(req.getOriginCountry())
                .originProvince(req.getOriginProvince())
                .shelfLifeDays(req.getShelfLifeDays())
                .minPreparationMinutes(req.getMinPreparationMinutes())
                .status(parseEnum(Product.ProductStatus.class, req.getStatus(), Product.ProductStatus.draft))
                .isActive(true)
                .build();

        Product saved = productRepository.save(product);
        saveImages(saved, req.getImageUrls());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long sellerId, Long productId, UpdateProductRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa sản phẩm này");
        }

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại"));
            product.setCategory(category);
        }
        if (req.getBrandId() != null) {
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new IllegalArgumentException("Thương hiệu không tồn tại"));
            product.setBrand(brand);
        }
        if (req.getName() != null) product.setName(req.getName());
        if (req.getSlug() != null) product.setSlug(req.getSlug());
        if (req.getShortDescription() != null) product.setShortDescription(req.getShortDescription());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getProductType() != null) product.setProductType(parseEnum(Product.ProductType.class, req.getProductType(), product.getProductType()));
        if (req.getSellMode() != null) product.setSellMode(parseEnum(Product.SellMode.class, req.getSellMode(), product.getSellMode()));
        if (req.getStorageType() != null) product.setStorageType(parseEnum(Product.StorageType.class, req.getStorageType(), product.getStorageType()));
        if (req.getOriginCountry() != null) product.setOriginCountry(req.getOriginCountry());
        if (req.getOriginProvince() != null) product.setOriginProvince(req.getOriginProvince());
        if (req.getShelfLifeDays() != null) product.setShelfLifeDays(req.getShelfLifeDays());
        if (req.getMinPreparationMinutes() != null) product.setMinPreparationMinutes(req.getMinPreparationMinutes());
        if (req.getStatus() != null) product.setStatus(parseEnum(Product.ProductStatus.class, req.getStatus(), product.getStatus()));

        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
            imageRepository.deleteByProductId(product.getId());
            saveImages(product, req.getImageUrls());
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse addVariantToProduct(Long sellerId, Long productId, CreateProductVariantRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền thêm biến thể cho sản phẩm này");
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .variantCode(req.getVariantCode())
                .name(req.getName())
                .barcode(req.getBarcode())
                .unit(parseEnum(ProductVariant.VariantUnit.class, req.getUnit(), ProductVariant.VariantUnit.piece))
                .netWeightValue(req.getNetWeightValue())
                .netWeightUnit(parseEnum(ProductVariant.WeightUnit.class, req.getNetWeightUnit(), null))
                .minOrderQty(req.getMinOrderQty() != null ? req.getMinOrderQty() : BigDecimal.ONE)
                .maxOrderQty(req.getMaxOrderQty())
                .stepQty(req.getStepQty() != null ? req.getStepQty() : BigDecimal.ONE)
                .listPrice(req.getListPrice())
                .salePrice(req.getSalePrice())
                .costPrice(req.getCostPrice())
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .requiresBatch(Boolean.TRUE.equals(req.getRequiresBatch()))
                .trackInventory(Boolean.TRUE.equals(req.getTrackInventory()))
                .status(parseEnum(ProductVariant.VariantStatus.class, req.getStatus(), ProductVariant.VariantStatus.draft))
                .build();

        variantRepository.save(variant);
        return toResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long sellerId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa sản phẩm này");
        }
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public InventoryBatchResponse addBatch(Long sellerId, CreateBatchRequest req) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));
        ProductVariant variant = variantRepository.findById(req.getVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Biến thể sản phẩm không tồn tại"));

        InventoryBatch batch = InventoryBatch.builder()
                .variant(variant)
                .seller(seller)
                .batchCode(req.getBatchCode())
                .supplierName(req.getSupplierName())
                .receivedAt(req.getReceivedAt())
                .manufacturedAt(req.getManufacturedAt())
                .expiredAt(req.getExpiredAt())
                .costPrice(req.getCostPrice())
                .quantityReceived(req.getQuantityReceived())
                .quantityAvailable(req.getQuantityReceived())
                .status(InventoryBatch.BatchStatus.active)
                .note(req.getNote())
                .build();

        return InventoryBatchResponse.fromEntity(batchRepository.save(batch));
    }

    @Override
    public List<InventoryBatchResponse> getSellerBatches(Long sellerId) {
        return batchRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(InventoryBatchResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public java.math.BigDecimal getVariantStock(Long variantId) {
        java.math.BigDecimal stock = batchRepository.sumAvailableByVariantId(variantId);
        return stock != null ? stock : java.math.BigDecimal.ZERO;
    }

    // ── Image management ──────────────────────────────────────────────────

    @Override
    public List<ProductImageResponse> getProductImages(Long sellerId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền xem ảnh sản phẩm này");
        }
        return imageRepository.findByProductIdOrderBySortOrderAsc(productId).stream()
                .map(ProductImageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductImageResponse addProductImage(Long sellerId, Long productId, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền thêm ảnh cho sản phẩm này");
        }
        List<ProductImage> existing = imageRepository.findByProductIdOrderBySortOrderAsc(productId);
        boolean noPrimary = existing.stream().noneMatch(img -> Boolean.TRUE.equals(img.getIsPrimary()));
        int nextOrder = existing.size();
        ProductImage image = imageRepository.save(ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isPrimary(noPrimary) // first image auto-primary
                .sortOrder(nextOrder)
                .build());
        return ProductImageResponse.fromEntity(image);
    }

    @Override
    @Transactional
    public void deleteProductImage(Long sellerId, Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa ảnh sản phẩm này");
        }
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Ảnh không tồn tại"));
        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());
        imageRepository.delete(image);
        // If deleted image was primary, promote next image
        if (wasPrimary) {
            List<ProductImage> remaining = imageRepository.findByProductIdOrderBySortOrderAsc(productId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsPrimary(true);
                imageRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional
    public ProductImageResponse setProductImagePrimary(Long sellerId, Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác ảnh sản phẩm này");
        }
        // Unset all primaries for this product
        List<ProductImage> allImages = imageRepository.findByProductIdOrderBySortOrderAsc(productId);
        allImages.forEach(img -> img.setIsPrimary(false));
        imageRepository.saveAll(allImages);
        // Set target as primary
        ProductImage target = allImages.stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Ảnh không tồn tại hoặc không thuộc sản phẩm này"));
        target.setIsPrimary(true);
        return ProductImageResponse.fromEntity(imageRepository.save(target));
    }

    // -------- helpers --------

    private ProductResponse toResponse(Product product) {
        List<ProductImage> allImages = imageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
        String primaryImage = allImages.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElseGet(() -> allImages.stream().findFirst().map(ProductImage::getImageUrl).orElse(null));

        List<ProductImageResponse> imageResponses = allImages.stream()
                .map(ProductImageResponse::fromEntity)
                .collect(Collectors.toList());

        List<ProductVariantResponse> variants = variantRepository.findByProductIdOrderByIsDefaultDescSalePriceAsc(product.getId())
                .stream()
                .map(variant -> {
                    BigDecimal stock = batchRepository.sumAvailableByVariantId(variant.getId());
                    return ProductVariantResponse.fromEntity(variant, stock);
                })
                .collect(Collectors.toList());

        return ProductResponse.fromEntityWithImages(product, primaryImage, imageResponses, variants);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> clazz, String value, E defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return Enum.valueOf(clazz, value);
        } catch (IllegalArgumentException e) {
            return defaultValue;
        }
    }

    private void saveImages(Product product, java.util.List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        for (int i = 0; i < imageUrls.size(); i++) {
            imageRepository.save(ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrls.get(i))
                    .isPrimary(i == 0)
                    .sortOrder(i)
                    .build());
        }
    }
}
