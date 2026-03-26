package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long sellerId;
    private String sellerName;
    private Long userId;
    private String userEmail;
    private String userName;
    private Integer rating;
    private String comment;
    private Boolean isSpam;
    private Boolean isNegativeFlagged;
    private Boolean unusualNegative;
    private String moderationNote;
    private LocalDateTime moderatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminReviewResponse fromEntity(Review review, boolean unusualNegative) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .sellerId(review.getProduct() != null && review.getProduct().getSeller() != null
                        ? review.getProduct().getSeller().getId()
                        : null)
                .sellerName(review.getProduct() != null && review.getProduct().getSeller() != null
                        ? review.getProduct().getSeller().getShopName()
                        : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .isSpam(Boolean.TRUE.equals(review.getIsSpam()))
                .isNegativeFlagged(Boolean.TRUE.equals(review.getIsNegativeFlagged()))
                .unusualNegative(unusualNegative)
                .moderationNote(review.getModerationNote())
                .moderatedAt(review.getModeratedAt())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
