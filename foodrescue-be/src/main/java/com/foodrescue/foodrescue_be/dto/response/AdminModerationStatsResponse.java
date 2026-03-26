package com.foodrescue.foodrescue_be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminModerationStatsResponse {
    private long totalReports;
    private long pendingReports;
    private long inReviewReports;
    private long resolvedReports;
    private long rejectedReports;
    private long spoiledFoodReports;
    private long misdescriptionReports;

    private long totalReviews;
    private long spamReviews;
    private long flaggedNegativeReviews;
    private double spamRate;

    private double avgResolutionHours;

    private List<TopSellerIssue> topSellersByReports;

    @Getter
    @Builder
    public static class TopSellerIssue {
        private Long sellerId;
        private String sellerName;
        private long totalReports;
        private long openReports;
        private long resolvedReports;
    }
}
