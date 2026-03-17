package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.CreateBatchRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductVariantRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductRequest;
import com.foodrescue.foodrescue_be.dto.request.UpdateProductRequest;
import com.foodrescue.foodrescue_be.dto.response.InventoryBatchResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductImageResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    Page<ProductResponse> getPublicProducts(Long categoryId, String keyword, String sort,
                                            BigDecimal minPrice, BigDecimal maxPrice, String province,
                                            Pageable pageable);

    ProductResponse getProductDetail(Long productId);

    // Seller operations
    Page<ProductResponse> getSellerProducts(Long sellerId, String keyword, Pageable pageable);

    ProductResponse createProduct(Long sellerId, CreateProductRequest request);

    ProductResponse updateProduct(Long sellerId, Long productId, UpdateProductRequest request);

    ProductResponse addVariantToProduct(Long sellerId, Long productId, CreateProductVariantRequest request);

    void deleteProduct(Long sellerId, Long productId);

    // Product images
    List<ProductImageResponse> getProductImages(Long sellerId, Long productId);

    ProductImageResponse addProductImage(Long sellerId, Long productId, String imageUrl);

    void deleteProductImage(Long sellerId, Long productId, Long imageId);

    ProductImageResponse setProductImagePrimary(Long sellerId, Long productId, Long imageId);

    // Inventory
    InventoryBatchResponse addBatch(Long sellerId, CreateBatchRequest request);

    List<InventoryBatchResponse> getSellerBatches(Long sellerId);

    java.math.BigDecimal getVariantStock(Long variantId);
}
