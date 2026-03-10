package com.foodrescue.foodrescue_be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class SellerStatsResponse {

    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private BigDecimal avgOrderValue;

    private List<DailyRevenue> dailyRevenue;
    private List<TopProduct> topProducts;

    @Getter
    @Builder
    public static class DailyRevenue {
        private String date;    // "dd/MM"
        private String dayLabel; // "T2", "T3", ...
        private BigDecimal revenue;
        private Long orders;
    }

    @Getter
    @Builder
    public static class TopProduct {
        private String name;
        private BigDecimal totalQty;
        private BigDecimal totalRevenue;
    }
}
