package com.foodrescue.foodrescue_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWasteAnalyticsResponse {

    private BigDecimal totalWasteQty;
    private BigDecimal estimatedWasteValue;
    private BigDecimal totalRecoveredQty;
    private BigDecimal recoveryRatePct;
    private Long affectedBatches;
    private LocalDateTime generatedAt;

    private List<WasteByCategory> topWasteCategories;
    private List<WasteByRegion> topWasteRegions;
    private List<WasteProduct> topWasteProducts;
    private EarlyWarningSummary earlyWarning;
    private List<WasteActionItem> wasteActionItems;
    private List<SmartMatchingSuggestion> smartMatchingSuggestions;
    private List<SurplusByHour> surplusByHour;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteByCategory {
        private String category;
        private BigDecimal wasteQty;
        private BigDecimal estimatedWasteValue;
        private BigDecimal sharePct;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteByRegion {
        private String region;
        private BigDecimal wasteQty;
        private BigDecimal estimatedWasteValue;
        private BigDecimal sharePct;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteProduct {
        private Long productId;
        private String productName;
        private String productCode;
        private String category;
        private String originProvince;
        private String imageUrl;
        private BigDecimal wasteQty;
        private BigDecimal estimatedWasteValue;
        private BigDecimal sharePct;
        private LocalDateTime latestExpiredAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarlyWarningSummary {
        private Long expiredNowCount;
        private Long expiringIn24hCount;
        private Long expiringIn48hCount;
        private Long expiringIn72hCount;
        private BigDecimal atRiskQty;
        private BigDecimal atRiskValue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteActionItem {
        private Long batchId;
        private String batchCode;
        private Long productId;
        private String productName;
        private String productCode;
        private String category;
        private String sellerName;
        private String imageUrl;
        private LocalDateTime expiredAt;
        private Long hoursToExpire;
        private BigDecimal quantityAvailable;
        private BigDecimal estimatedValue;
        private String recommendedAction;
        private String priority;
        private String reason;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmartMatchingSuggestion {
        private Long batchId;
        private String batchCode;
        private String sellerName;
        private Long productId;
        private String productName;
        private String category;
        private String targetProvince;
        private String suggestedTimeSlot;
        private BigDecimal quantityAvailable;
        private BigDecimal estimatedValue;
        private Integer confidenceScore;
        private String suggestionText;
        private String basis;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurplusByHour {
        private Integer hour;
        private String label;
        private BigDecimal wasteQty;
    }
}