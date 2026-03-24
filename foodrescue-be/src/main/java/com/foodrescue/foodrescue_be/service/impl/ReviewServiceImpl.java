package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.ReviewCreateRequest;
import com.foodrescue.foodrescue_be.dto.request.ReviewUpdateRequest;
import com.foodrescue.foodrescue_be.dto.response.ReviewResponse;
import com.foodrescue.foodrescue_be.dto.response.ProductReviewSummary;
import com.foodrescue.foodrescue_be.exception.ResourceNotFoundException;
import com.foodrescue.foodrescue_be.exception.InvalidOperationException;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import com.foodrescue.foodrescue_be.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Lấy review của user cho product
     */
    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getMyReviewForProduct(Long productId) {
        User currentUser = getCurrentUser();
        return reviewRepository.findByProductIdAndUserIdWithUser(productId, currentUser.getId())
            .map(this::mapToResponse)
            .orElse(null);
    }

    /**
     * Check user đã mua product này (paid) chưa
     */
    @Override
    @Transactional(readOnly = true)
    public boolean canUserReviewProduct(Long productId) {
        User currentUser = getCurrentUser();
        
        // Get all orders by user (status không quan trọng, miễn là đã thanh toán)
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        for (Order order : userOrders) {
            // User phải đã thanh toán (paymentStatus = PAID)
            if (order.getPaymentStatus() != Order.PaymentStatus.paid) {
                continue;
            }
            
            // Use eager fetch query để tránh lazy initialization exception
            List<OrderItem> items = orderItemRepository.findByOrderIdWithVariantAndProduct(order.getId());
            for (OrderItem item : items) {
                if (item != null && item.getVariant() != null && item.getVariant().getProduct() != null) {
                    if (item.getVariant().getProduct().getId().equals(productId)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Tạo review mới
     */
    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check user đã review chưa (unique constraint)
        if (reviewRepository.existsByProductIdAndUserId(product.getId(), currentUser.getId())) {
            throw new InvalidOperationException("Bạn đã đánh giá sản phẩm này rồi");
        }

        // Check user có quyền review không (must have completed order)
        if (!canUserReviewProduct(product.getId())) {
            throw new InvalidOperationException("Bạn chỉ có thể đánh giá sản phẩm đã mua");
        }

        // Validate rating
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidOperationException("Rating phải từ 1-5");
        }

        Review review = Review.builder()
            .product(product)
            .user(currentUser)
            .rating(request.getRating())
            .comment(request.getComment())
            .build();

        Review saved = reviewRepository.save(review);

        // Save images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ReviewImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(ReviewImage.builder()
                    .review(saved)
                    .imageUrl(request.getImageUrls().get(i))
                    .displayOrder(i)
                    .build());
            }
            reviewImageRepository.saveAll(images);
        }

        return mapToResponse(saved);
    }

    /**
     * Cập nhật review
     */
    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request) {
        User currentUser = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Check ownership
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new InvalidOperationException("Bạn không có quyền sửa review này");
        }

        // Validate rating
        if (request.getRating() != null && (request.getRating() < 1 || request.getRating() > 5)) {
            throw new InvalidOperationException("Rating phải từ 1-5");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        // Update images
        if (request.getImageUrls() != null) {
            reviewImageRepository.deleteByReviewId(reviewId);
            if (!request.getImageUrls().isEmpty()) {
                List<ReviewImage> images = new ArrayList<>();
                for (int i = 0; i < request.getImageUrls().size(); i++) {
                    images.add(ReviewImage.builder()
                        .review(review)
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build());
                }
                reviewImageRepository.saveAll(images);
            }
        }

        Review updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    /**
     * Xóa review
     */
    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        User currentUser = getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Check ownership
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new InvalidOperationException("Bạn không có quyền xóa review này");
        }

        reviewRepository.deleteById(reviewId);
    }

    /**
     * Lấy tất cả reviews của product
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductIdWithUser(productId, pageable);
        return new PageImpl<>(
            reviews.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()),
            pageable,
            reviews.getTotalElements()
        );
    }

    /**
     * Lấy thống kê reviews của product
     */
    @Override
    public ProductReviewSummary getProductReviewSummary(Long productId) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long totalReviews = reviewRepository.countByProductId(productId);

        // Get rating counts
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }
        reviewRepository.countReviewsByRatingForProduct(productId).forEach(result -> {
            Integer rating = (Integer) result[0];
            Long count = ((Number) result[1]).longValue();
            ratingCounts.put(rating, count);
        });

        return ProductReviewSummary.builder()
            .averageRating(avgRating != null ? avgRating : 0.0)
            .totalReviews(totalReviews)
            .ratingCounts(ratingCounts)
            .build();
    }

    /**
     * Lấy thống kê đánh giá của tất cả sản phẩm của seller hiện tại
     */
    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummary getSellerRatingStats() {
        User currentUser = getCurrentUser();
        log.info("=== getSellerRatingStats START ===");
        log.info("Current user ID: {}, Email: {}", currentUser.getId(), currentUser.getEmail());
        
        // Lấy tất cả sản phẩm của seller
        List<Product> sellerProducts = productRepository.findByUserId(currentUser.getId());
        log.info("Found {} seller products", sellerProducts.size());
        for (Product p : sellerProducts) {
            log.info("  - Product ID: {}, Name: {}", p.getId(), p.getName());
        }
        
        List<Long> productIds = sellerProducts.stream().map(Product::getId).collect(Collectors.toList());
        
        if (productIds.isEmpty()) {
            log.warn("No products found for user ID: {}", currentUser.getId());
            return ProductReviewSummary.builder()
                .averageRating(0.0)
                .totalReviews(0L)
                .ratingCounts(new HashMap<>())
                .build();
        }
        
        // Tính average rating của tất cả sản phẩm
        Double avgRating = reviewRepository.getAverageRatingByProductIds(productIds);
        long totalReviews = reviewRepository.countByProductIds(productIds);
        log.info("Average rating: {}, Total reviews: {}", avgRating, totalReviews);
        
        // Get rating counts
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }
        reviewRepository.countReviewsByRatingForProducts(productIds).forEach(result -> {
            Integer rating = (Integer) result[0];
            Long count = ((Number) result[1]).longValue();
            ratingCounts.put(rating, count);
        });
        
        log.info("Rating counts: {}", ratingCounts);
        log.info("=== getSellerRatingStats END ===");
        
        return ProductReviewSummary.builder()
            .averageRating(avgRating != null ? avgRating : 0.0)
            .totalReviews(totalReviews)
            .ratingCounts(ratingCounts)
            .build();
    }

    /**
     * Lấy top 5 sản phẩm được đánh giá cao nhất của seller hiện tại
     */
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopRatedSellerProducts(int limit) {
        User currentUser = getCurrentUser();
        log.info("=== getTopRatedSellerProducts START ===");
        log.info("Current user ID: {}, Limit: {}", currentUser.getId(), limit);
        
        // Lấy tất cả sản phẩm của seller
        List<Product> sellerProducts = productRepository.findByUserId(currentUser.getId());
        log.info("Found {} seller products", sellerProducts.size());
        
        List<Long> productIds = sellerProducts.stream().map(Product::getId).collect(Collectors.toList());
        
        if (productIds.isEmpty()) {
            log.warn("No products found for user ID: {}", currentUser.getId());
            return new ArrayList<>();
        }
        
        // Lấy top products by average rating
        List<Map<String, Object>> topProducts = reviewRepository.getTopRatedProducts(productIds, limit);
        log.info("Found {} top rated products", topProducts.size());
        for (Map<String, Object> product : topProducts) {
            log.info("  - Product: {}", product);
        }
        log.info("=== getTopRatedSellerProducts END ===");
        
        return topProducts;
    }

    // ============ Helpers ============

    private ReviewResponse mapToResponse(Review review) {
        List<String> imageUrls = reviewImageRepository
            .findByReviewIdOrderByDisplayOrder(review.getId())
            .stream()
            .map(ReviewImage::getImageUrl)
            .collect(Collectors.toList());

        return ReviewResponse.builder()
            .id(review.getId())
            .productId(review.getProduct().getId())
            .userId(review.getUser().getId())
            .userName(review.getUser().getFullName())
            .rating(review.getRating())
            .comment(review.getComment())
            .imageUrls(imageUrls)
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .build();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
