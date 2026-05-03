package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.CreateBatchRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductVariantRequest;
import com.foodrescue.foodrescue_be.dto.request.UpdateProductRequest;
import com.foodrescue.foodrescue_be.dto.response.InventoryBatchResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductImageResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductResponse;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private ProductImageRepository imageRepository;
    @Mock
    private InventoryBatchRepository batchRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private final List<ProductImage> storedImages = new ArrayList<>();
    private final List<ProductVariant> storedVariants = new ArrayList<>();

    @BeforeEach
    void setUpRepositories() {
        storedImages.clear();
        storedVariants.clear();

        when(imageRepository.save(any(ProductImage.class))).thenAnswer(invocation -> {
            ProductImage image = invocation.getArgument(0);
            if (image.getId() == null) {
                image.setId((long) (storedImages.size() + 1));
            }
            storedImages.removeIf(existing -> existing.getId().equals(image.getId()));
            storedImages.add(image);
            return image;
        });
        when(imageRepository.findByProductIdOrderBySortOrderAsc(anyLong()))
                .thenAnswer(invocation -> new ArrayList<>(storedImages));
        when(variantRepository.findByProductIdOrderByIsDefaultDescSalePriceAsc(anyLong()))
                .thenAnswer(invocation -> new ArrayList<>(storedVariants));
        when(batchRepository.sumAvailableByVariantId(anyLong())).thenReturn(BigDecimal.TEN);
    }

    @Test
    void createProduct_savesImagesAndReturnsPrimaryImage() {
        Seller seller = seller(1L);
        Category category = category(2L);
        Product savedProduct = baseProduct(100L, seller, category);
        CreateProductRequest request = createProductRequest();

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductResponse response = productService.createProduct(1L, request);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getName()).isEqualTo("Rau cai xanh");
        assertThat(response.getPrimaryImageUrl()).isEqualTo("https://img/1.jpg");
        assertThat(response.getImages()).hasSize(2);
    }

    @Test
    void updateProduct_replacesImagesAndStatus() {
        Product product = baseProduct(100L, seller(1L), category(2L));
        UpdateProductRequest request = new UpdateProductRequest();
        request.setName("Rau huu co");
        request.setStatus("active");
        request.setImageUrls(List.of("https://img/new.jpg"));

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.updateProduct(1L, 100L, request);

        assertThat(response.getName()).isEqualTo("Rau huu co");
        assertThat(response.getStatus()).isEqualTo(Product.ProductStatus.active.name());
        assertThat(response.getImages()).extracting(ProductImageResponse::getImageUrl)
                .containsExactly("https://img/new.jpg");
        verify(imageRepository).deleteByProductId(100L);
    }

    @Test
    void addVariantToProduct_returnsVariantInResponse() {
        Product product = baseProduct(100L, seller(1L), category(2L));
        CreateProductVariantRequest request = new CreateProductVariantRequest();
        request.setVariantCode("VAR-01");
        request.setName("Goi 500g");
        request.setUnit("pack");
        request.setMinOrderQty(BigDecimal.ONE);
        request.setStepQty(BigDecimal.ONE);
        request.setListPrice(new BigDecimal("30000"));
        request.setSalePrice(new BigDecimal("20000"));
        request.setStatus("active");

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(variantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> {
            ProductVariant variant = invocation.getArgument(0);
            variant.setId(200L);
            storedVariants.add(variant);
            return variant;
        });

        ProductResponse response = productService.addVariantToProduct(1L, 100L, request);

        assertThat(response.getVariants()).hasSize(1);
        assertThat(response.getVariants().get(0).getName()).isEqualTo("Goi 500g");
        assertThat(response.getVariants().get(0).getSalePrice()).isEqualByComparingTo("20000");
    }

    @Test
    void addBatch_setsAvailableQuantityFromReceivedQuantity() {
        Seller seller = seller(1L);
        ProductVariant variant = variant(11L, baseProduct(100L, seller, category(2L)));
        CreateBatchRequest request = new CreateBatchRequest();
        request.setVariantId(11L);
        request.setBatchCode("B-001");
        request.setSupplierName("Supplier A");
        request.setReceivedAt(LocalDateTime.of(2026, 3, 26, 9, 0));
        request.setManufacturedAt(LocalDateTime.of(2026, 3, 25, 9, 0));
        request.setExpiredAt(LocalDateTime.of(2026, 3, 30, 9, 0));
        request.setCostPrice(new BigDecimal("15000"));
        request.setQuantityReceived(new BigDecimal("25"));
        request.setNote("Fresh batch");

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(variantRepository.findById(11L)).thenReturn(Optional.of(variant));
        when(batchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> {
            InventoryBatch batch = invocation.getArgument(0);
            batch.setId(300L);
            return batch;
        });

        InventoryBatchResponse response = productService.addBatch(1L, request);

        assertThat(response.getId()).isEqualTo(300L);
        assertThat(response.getQuantityAvailable()).isEqualByComparingTo("25");
        assertThat(response.getStatus()).isEqualTo(InventoryBatch.BatchStatus.active.name());
    }

    @Test
    void getVariantStock_returnsZeroWhenNoBatchExists() {
        when(batchRepository.sumAvailableByVariantId(99L)).thenReturn(null);

        BigDecimal stock = productService.getVariantStock(99L);

        assertThat(stock).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void setProductImagePrimary_marksSelectedImageAsPrimary() {
        Product product = baseProduct(100L, seller(1L), category(2L));
        ProductImage first = ProductImage.builder().id(1L).product(product).imageUrl("https://img/1.jpg").isPrimary(true).sortOrder(0).build();
        ProductImage second = ProductImage.builder().id(2L).product(product).imageUrl("https://img/2.jpg").isPrimary(false).sortOrder(1).build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(imageRepository.findByProductIdOrderBySortOrderAsc(100L)).thenReturn(List.of(first, second));
        when(imageRepository.save(any(ProductImage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductImageResponse response = productService.setProductImagePrimary(1L, 100L, 2L);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getIsPrimary()).isTrue();
    }

    @Test
    void deleteProduct_throwsWhenSellerDoesNotOwnProduct() {
        Product product = baseProduct(100L, seller(9L), category(2L));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> productService.deleteProduct(1L, 100L));

        assertThat(exception.getMessage()).contains("quy");
    }

    private CreateProductRequest createProductRequest() {
        CreateProductRequest request = new CreateProductRequest();
        request.setCategoryId(2L);
        request.setProductCode("P-001");
        request.setName("Rau cai xanh");
        request.setSlug("rau-cai-xanh");
        request.setShortDescription("Rau tuoi");
        request.setDescription("Rau tuoi trong ngay");
        request.setProductType("vegetable");
        request.setSellMode("by_unit");
        request.setStorageType("ambient");
        request.setOriginCountry("Viet Nam");
        request.setOriginProvince("Lam Dong");
        request.setShelfLifeDays(3);
        request.setMinPreparationMinutes(15);
        request.setStatus("draft");
        request.setImageUrls(List.of("https://img/1.jpg", "https://img/2.jpg"));
        return request;
    }

    private Product baseProduct(Long id, Seller seller, Category category) {
        return Product.builder()
                .id(id)
                .seller(seller)
                .category(category)
                .productCode("P-001")
                .name("Rau cai xanh")
                .slug("rau-cai-xanh")
                .productType(Product.ProductType.vegetable)
                .sellMode(Product.SellMode.by_unit)
                .storageType(Product.StorageType.ambient)
                .status(Product.ProductStatus.draft)
                .isActive(true)
                .build();
    }

    private ProductVariant variant(Long id, Product product) {
        return ProductVariant.builder()
                .id(id)
                .product(product)
                .variantCode("VAR-01")
                .name("Goi 500g")
                .unit(ProductVariant.VariantUnit.pack)
                .minOrderQty(BigDecimal.ONE)
                .stepQty(BigDecimal.ONE)
                .listPrice(new BigDecimal("30000"))
                .salePrice(new BigDecimal("20000"))
                .status(ProductVariant.VariantStatus.active)
                .build();
    }

    private Seller seller(Long id) {
        return Seller.builder()
                .id(id)
                .shopName("Shop " + id)
                .shopSlug("shop-" + id)
                .phone("0900000000")
                .pickupAddress("Thu Duc")
                .ratingAvg(new BigDecimal("4.5"))
                .isVerified(true)
                .build();
    }

    private Category category(Long id) {
        return Category.builder()
                .id(id)
                .name("Vegetable")
                .slug("vegetable")
                .level(1)
                .sortOrder(1)
                .isActive(true)
                .build();
    }
}
