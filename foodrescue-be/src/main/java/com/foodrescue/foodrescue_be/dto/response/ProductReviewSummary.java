package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.dto.response.ReviewResponse;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewSummary {
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingCounts; // rating -> count
    private List<ReviewResponse> topReviews; // Top 3 helpful reviews
}
