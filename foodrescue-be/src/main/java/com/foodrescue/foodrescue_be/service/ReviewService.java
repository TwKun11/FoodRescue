package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.ReviewCreateRequest;
import com.foodrescue.foodrescue_be.dto.request.ReviewUpdateRequest;
import com.foodrescue.foodrescue_be.dto.response.ReviewResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductReviewSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * ReviewService Interface - định nghĩa các method cho review
 */
public interface ReviewService {

    /**
     * Lấy review của user cho product
     */
    ReviewResponse getMyReviewForProduct(Long productId);

    /**
     * Check user đã mua product này (completed order) chưa
     */
    boolean canUserReviewProduct(Long productId);

    /**
     * Tạo review mới
     */
    ReviewResponse createReview(ReviewCreateRequest request);

    /**
     * Cập nhật review
     */
    ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request);

    /**
     * Xóa review
     */
    void deleteReview(Long reviewId);

    /**
     * Lấy tất cả reviews của product
     */
    Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable);

    /**
     * Lấy thống kê reviews của product
     */
    ProductReviewSummary getProductReviewSummary(Long productId);

    /**
     * Lấy thống kê đánh giá của tất cả sản phẩm của seller hiện tại
     */
    ProductReviewSummary getSellerRatingStats();

    /**
     * Lấy top 5 sản phẩm được đánh giá cao nhất của seller hiện tại
     */
    List<Map<String, Object>> getTopRatedSellerProducts(int limit);

    /**
     * Lấy tất cả reviews được gửi cho seller (pageable)
     */
    Page<ReviewResponse> getSellerReceivedReviews(Pageable pageable);

    /**
     * Lấy reviews của 1 sản phẩm cụ thể của seller (pageable)
     */
    Page<ReviewResponse> getSellerProductReviews(Long productId, Pageable pageable);

    /**
     * Lấy tất cả sản phẩm của seller với rating stats (pageable)
     */
    Page<Map<String, Object>> getSellerProductsWithRatings(Pageable pageable);

    /**
     * Lấy tất cả sản phẩm của seller với rating stats (manual pagination)
     */
    Map<String, Object> getSellerProductsWithRatingsManual(int page, int size);
}
