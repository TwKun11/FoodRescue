package com.foodrescue.foodrescue_be.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class AdminStatsResponse {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private BigDecimal avgOrderValue;
    private List<BigDecimal> monthlyRevenue;  // 12 months
    private Long totalSellers;
    private Long activeSellers;
    private LocalDateTime generatedAt;
}
