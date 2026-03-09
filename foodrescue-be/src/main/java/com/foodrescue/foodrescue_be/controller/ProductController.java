package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.CreateBatchRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductVariantRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateProductRequest;
import com.foodrescue.foodrescue_be.dto.request.UpdateProductRequest;
import com.foodrescue.foodrescue_be.dto.response.InventoryBatchResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.security.JwtUtil;
import com.foodrescue.foodrescue_be.service.CloudinaryService;
import com.foodrescue.foodrescue_be.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;

    // ---- Public endpoints ----

    @GetMapping("/api/products")
    public ResponseData<Page<ProductResponse>> listPublic(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseData.ok(productService.getPublicProducts(
                categoryId, keyword,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        ));
    }

    @GetMapping("/api/products/{id}")
    public ResponseData<ProductResponse> detail(@PathVariable Long id) {
        return ResponseData.ok(productService.getProductDetail(id));
    }

    @GetMapping("/api/products/variants/{variantId}/stock")
    public ResponseData<java.math.BigDecimal> variantStock(@PathVariable Long variantId) {
        return ResponseData.ok(productService.getVariantStock(variantId));
    }

    // ---- Seller endpoints ----

    @GetMapping("/api/seller/products")
    public ResponseData<Page<ProductResponse>> sellerList(
            Authentication auth,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok(productService.getSellerProducts(
                sellerId, keyword,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        ));
    }

    @PostMapping("/api/seller/products")
    public ResponseData<ProductResponse> createProduct(
            Authentication auth,
            @RequestBody @Valid CreateProductRequest request
    ) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok("Tạo sản phẩm thành công", productService.createProduct(sellerId, request));
    }

    @PostMapping("/api/seller/products/{productId}/variants")
    public ResponseData<ProductResponse> addVariant(
            Authentication auth,
            @PathVariable Long productId,
            @RequestBody @Valid CreateProductVariantRequest request
    ) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok("Thêm biến thể thành công", productService.addVariantToProduct(sellerId, productId, request));
    }

    @DeleteMapping("/api/seller/products/{productId}")
    public ResponseData<Void> deleteProduct(Authentication auth, @PathVariable Long productId) {
        Long sellerId = extractSellerId(auth);
        productService.deleteProduct(sellerId, productId);
        return ResponseData.ok("Xóa sản phẩm thành công", null);
    }

    @PutMapping("/api/seller/products/{productId}")
    public ResponseData<ProductResponse> updateProduct(
            Authentication auth,
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductRequest request
    ) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok("Cập nhật sản phẩm thành công", productService.updateProduct(sellerId, productId, request));
    }

    @PostMapping("/api/seller/upload")
    public ResponseData<String> uploadImage(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) throw new IllegalArgumentException("File không được để trống");
        String url = cloudinaryService.uploadImage(file, "foodrescue/products");
        return ResponseData.ok("Tải ảnh thành công", url);
    }

    // ---- Inventory ----

    @PostMapping("/api/seller/inventory/batches")
    public ResponseData<InventoryBatchResponse> addBatch(
            Authentication auth,
            @RequestBody @Valid CreateBatchRequest request
    ) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok("Nhập lô thành công", productService.addBatch(sellerId, request));
    }

    @GetMapping("/api/seller/inventory/batches")
    public ResponseData<List<InventoryBatchResponse>> getBatches(Authentication auth) {
        Long sellerId = extractSellerId(auth);
        return ResponseData.ok(productService.getSellerBatches(sellerId));
    }

    // ----

    private Long extractSellerId(Authentication auth) {
        if (auth == null) throw new IllegalArgumentException("Chưa đăng nhập");
        String principal = (String) auth.getPrincipal();
        return resolveSellerIdByEmail(principal);
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.foodrescue.foodrescue_be.repository.SellerRepository sellerRepository;

    private Long resolveSellerIdByEmail(String email) {
        return sellerRepository.findByUserEmail(email)
                .map(s -> s.getId())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa được liên kết với cửa hàng nào"));
    }
}
