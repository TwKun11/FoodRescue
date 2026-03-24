package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.ReviewCreateRequest;
import com.foodrescue.foodrescue_be.dto.request.ReviewUpdateRequest;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.ReviewResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductReviewSummary;
import com.foodrescue.foodrescue_be.exception.InvalidOperationException;
import com.foodrescue.foodrescue_be.exception.ResourceNotFoundException;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.repository.ProductRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.service.CloudinaryService;
import com.foodrescue.foodrescue_be.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * Lấy reviews của product với phân trang
     */
    @GetMapping("/product/{productId}")
    public ResponseData<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseData.ok(reviewService.getProductReviews(productId, pageable));
    }

    /**
     * Lấy review của user hiện tại cho product
     */
    @GetMapping("/product/{productId}/my-review")
    public ResponseData<ReviewResponse> getMyReview(@PathVariable Long productId) {
        ReviewResponse review = reviewService.getMyReviewForProduct(productId);
        if (review == null) {
            return ResponseData.ok(null);
        }
        return ResponseData.ok(review);
    }

    /**
     * Kiểm tra user có thể review product này không
     */
    @GetMapping("/product/{productId}/can-review")
    public ResponseData<Map<String, Boolean>> canReviewProduct(@PathVariable Long productId) {
        boolean canReview = reviewService.canUserReviewProduct(productId);
        Map<String, Boolean> result = new HashMap<>();
        result.put("canReview", canReview);
        return ResponseData.ok(result);
    }

    /**
     * Lấy thống kê reviews của product (trung bình điểm và phân bổ theo sao)
     */
    @GetMapping("/product/{productId}/summary")
    public ResponseData<ProductReviewSummary> getReviewSummary(@PathVariable Long productId) {
        ProductReviewSummary summary = reviewService.getProductReviewSummary(productId);
        return ResponseData.ok(summary);
    }

    /**
     * Tạo review mới
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return ResponseData.ok(response);
    }

    /**
     * Cập nhật review
     */
    @PutMapping("/{id}")
    public ResponseData<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        ReviewResponse response = reviewService.updateReview(id, request);
        return ResponseData.ok(response);
    }

    /**
     * Xóa review
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    /**
     * Upload hình ảnh review
     */
    @PostMapping("/upload-image")
    public ResponseData<Map<String, String>> uploadReviewImage(
            @RequestParam("file") MultipartFile file
    ) {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("File không được để trống");
        }

        // Check file size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new InvalidOperationException("Kích thước file không được vượt quá 5MB");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidOperationException("File phải là hình ảnh");
        }

        // Allowed image types
        String[] allowedTypes = {"image/jpeg", "image/jpg", "image/png", "image/webp"};
        boolean isAllowed = false;
        for (String type : allowedTypes) {
            if (contentType.equals(type)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new InvalidOperationException("Định dạng ảnh không được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WebP");
        }

        String imageUrl = cloudinaryService.uploadImage(file, "reviews");
        Map<String, String> result = new HashMap<>();
        result.put("imageUrl", imageUrl);
        return ResponseData.ok(result);
    }

    /**
     * Lấy thống kê đánh giá của tất cả sản phẩm của seller hiện tại
     */
    @GetMapping("/seller/stats")
    public ResponseData<ProductReviewSummary> getSellerRatingStats() {
        ProductReviewSummary stats = reviewService.getSellerRatingStats();
        return ResponseData.ok(stats);
    }

    /**
     * Lấy top N sản phẩm được đánh giá cao nhất của seller
     */
    @GetMapping("/seller/top-products")
    public ResponseData<java.util.List<Map<String, Object>>> getTopRatedSellerProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        java.util.List<Map<String, Object>> topProducts = reviewService.getTopRatedSellerProducts(limit);
        return ResponseData.ok(topProducts);
    }

    /**
     * DEBUG: Get current seller's products
     */
    @GetMapping("/seller/debug/products")
    public ResponseData<String> debugSellerProducts() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            java.util.List<com.foodrescue.foodrescue_be.model.Product> products = 
                productRepository.findByUserId(currentUser.getId());
            
            String result = String.format(
                "Current User: %s (ID: %d), Found %d products",
                email, currentUser.getId(), products.size()
            );
            
            for (com.foodrescue.foodrescue_be.model.Product p : products) {
                result += String.format("\n  - Product ID: %d, Name: %s", p.getId(), p.getName());
            }
            
            return ResponseData.ok(result);
        } catch (Exception e) {
            return ResponseData.error("Error: " + e.getMessage());
        }
    }

    /**
     * MOCK: Return hardcoded top-rated products để test frontend
     */
    @GetMapping("/seller/mock/top-products")
    public ResponseData<java.util.List<java.util.Map<String, Object>>> mockTopRatedProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        // Mock product 1
        java.util.Map<String, Object> p1 = new java.util.HashMap<>();
        p1.put("id", 1L);
        p1.put("name", "Cá viên ba su tuối");
        p1.put("primaryImageUrl", "https://via.placeholder.com/200");
        p1.put("avgRating", 5.0);
        p1.put("reviewCount", 1L);
        result.add(p1);
        
        // Mock product 2
        java.util.Map<String, Object> p2 = new java.util.HashMap<>();
        p2.put("id", 2L);
        p2.put("name", "Thịt heo ba chỉ tuối sốn");
        p2.put("primaryImageUrl", "https://via.placeholder.com/200");
        p2.put("avgRating", 4.5);
        p2.put("reviewCount", 2L);
        result.add(p2);
        
        return ResponseData.ok(result);
    }
}
