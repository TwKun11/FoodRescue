package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.ReviewCreateRequest;
import com.foodrescue.foodrescue_be.dto.request.ReviewUpdateRequest;
import com.foodrescue.foodrescue_be.dto.response.ProductReviewSummary;
import com.foodrescue.foodrescue_be.dto.response.ReviewResponse;
import com.foodrescue.foodrescue_be.exception.InvalidOperationException;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewImageRepository reviewImageRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createReview_savesReviewAndImagesForPurchasedProduct() {
        User user = currentUser();
        Product product = product(10L);
        Order paidOrder = Order.builder().id(20L).paymentStatus(Order.PaymentStatus.paid).build();
        OrderItem purchasedItem = OrderItem.builder().id(30L).variant(variant(40L, product)).build();

        authenticate(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndUserId(10L, 1L)).thenReturn(false);
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L, org.springframework.data.domain.Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(paidOrder)));
        when(orderItemRepository.findByOrderIdWithVariantAndProduct(20L)).thenReturn(List.of(purchasedItem));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId(50L);
            return review;
        });
        when(reviewImageRepository.findByReviewIdOrderByDisplayOrder(50L)).thenReturn(List.of(
                ReviewImage.builder().id(1L).imageUrl("https://img/review-1.jpg").displayOrder(0).build(),
                ReviewImage.builder().id(2L).imageUrl("https://img/review-2.jpg").displayOrder(1).build()
        ));

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .productId(10L)
                .rating(5)
                .comment("Rat on")
                .imageUrls(List.of("https://img/review-1.jpg", "https://img/review-2.jpg"))
                .build();

        ReviewResponse response = reviewService.createReview(request);

        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getImageUrls()).hasSize(2);
        verify(reviewImageRepository).saveAll(any());
    }

    @Test
    void createReview_throwsWhenProductAlreadyReviewed() {
        User user = currentUser();
        Product product = product(10L);

        authenticate(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndUserId(10L, 1L)).thenReturn(true);

        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .productId(10L)
                .rating(5)
                .comment("Duplicate")
                .build();

        InvalidOperationException exception = assertThrows(InvalidOperationException.class,
                () -> reviewService.createReview(request));

        assertThat(exception.getMessage()).contains("đánh giá");
    }

    @Test
    void updateReview_replacesImagesAndUpdatesRating() {
        User user = currentUser();
        Product product = product(10L);
        Review review = Review.builder()
                .id(50L)
                .product(product)
                .user(user)
                .rating(4)
                .comment("Old")
                .build();

        authenticate(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reviewImageRepository.findByReviewIdOrderByDisplayOrder(50L)).thenReturn(List.of(
                ReviewImage.builder().imageUrl("https://img/new-1.jpg").displayOrder(0).build()
        ));

        ReviewUpdateRequest request = ReviewUpdateRequest.builder()
                .rating(5)
                .comment("Updated")
                .imageUrls(List.of("https://img/new-1.jpg"))
                .build();

        ReviewResponse response = reviewService.updateReview(50L, request);

        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Updated");
        verify(reviewImageRepository).deleteByReviewId(50L);
        verify(reviewImageRepository).saveAll(any());
    }

    @Test
    void getProductReviewSummary_buildsAverageAndRatingBreakdown() {
        when(reviewRepository.getAverageRatingByProductId(10L)).thenReturn(4.5);
        when(reviewRepository.countByProductId(10L)).thenReturn(4L);
        when(reviewRepository.countReviewsByRatingForProduct(10L)).thenReturn(List.of(
                new Object[]{5, 3L},
                new Object[]{4, 1L}
        ));

        ProductReviewSummary summary = reviewService.getProductReviewSummary(10L);

        assertThat(summary.getAverageRating()).isEqualTo(4.5);
        assertThat(summary.getTotalReviews()).isEqualTo(4L);
        assertThat(summary.getRatingCounts()).containsEntry(5, 3L).containsEntry(4, 1L);
    }

    @Test
    void canUserReviewProduct_returnsFalseWhenOnlyUnpaidOrdersExist() {
        User user = currentUser();
        Order unpaidOrder = Order.builder().id(21L).paymentStatus(Order.PaymentStatus.pending).build();

        authenticate(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L, org.springframework.data.domain.Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(unpaidOrder)));

        boolean canReview = reviewService.canUserReviewProduct(10L);

        assertThat(canReview).isFalse();
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(email, "password"));
    }

    private User currentUser() {
        return User.builder()
                .id(1L)
                .email("reviewer@example.com")
                .fullName("Reviewer")
                .build();
    }

    private Product product(Long id) {
        return Product.builder()
                .id(id)
                .name("Rau cai xanh")
                .build();
    }

    private ProductVariant variant(Long id, Product product) {
        return ProductVariant.builder()
                .id(id)
                .product(product)
                .name("Goi 500g")
                .variantCode("VAR-01")
                .build();
    }
}
