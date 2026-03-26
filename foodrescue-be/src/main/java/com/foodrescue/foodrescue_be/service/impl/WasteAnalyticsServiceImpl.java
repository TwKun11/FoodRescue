package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.response.AdminWasteAnalyticsResponse;
import com.foodrescue.foodrescue_be.model.InventoryBatch;
import com.foodrescue.foodrescue_be.repository.InventoryBatchRepository;
import com.foodrescue.foodrescue_be.service.WasteAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WasteAnalyticsServiceImpl implements WasteAnalyticsService {

    private final InventoryBatchRepository inventoryBatchRepository;

    @Override
    public AdminWasteAnalyticsResponse getWasteAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        List<InventoryBatch> batches = inventoryBatchRepository.findExpiredBatchesWithRemainingQty(now);

        if (batches.isEmpty()) {
            return AdminWasteAnalyticsResponse.builder()
                    .totalWasteQty(BigDecimal.ZERO)
                    .estimatedWasteValue(BigDecimal.ZERO)
                    .totalRecoveredQty(BigDecimal.ZERO)
                    .recoveryRatePct(BigDecimal.ZERO)
                    .affectedBatches(0L)
                    .generatedAt(now)
                    .topWasteCategories(List.of())
                    .topWasteRegions(List.of())
                    .surplusByHour(buildEmptyHourSeries())
                    .build();
        }

        BigDecimal totalWasteQty = BigDecimal.ZERO;
        BigDecimal estimatedWasteValue = BigDecimal.ZERO;
        BigDecimal totalRecoveredQty = BigDecimal.ZERO;
        BigDecimal totalReceivedQty = BigDecimal.ZERO;

        Map<String, AggregateBucket> byCategory = new HashMap<>();
        Map<String, AggregateBucket> byRegion = new HashMap<>();
        Map<Integer, BigDecimal> byHour = new HashMap<>();

        for (InventoryBatch batch : batches) {
            BigDecimal wasteQty = safe(batch.getQuantityAvailable());
            if (wasteQty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal costPrice = safe(batch.getCostPrice());
            BigDecimal wasteValue = wasteQty.multiply(costPrice);
            BigDecimal qtyReceived = safe(batch.getQuantityReceived());
            BigDecimal recoveredQty = qtyReceived.subtract(wasteQty);
            if (recoveredQty.compareTo(BigDecimal.ZERO) < 0) {
                recoveredQty = BigDecimal.ZERO;
            }

            totalWasteQty = totalWasteQty.add(wasteQty);
            estimatedWasteValue = estimatedWasteValue.add(wasteValue);
            totalReceivedQty = totalReceivedQty.add(qtyReceived);
            totalRecoveredQty = totalRecoveredQty.add(recoveredQty);

            String categoryName = extractCategoryName(batch);
            byCategory.computeIfAbsent(categoryName, ignored -> new AggregateBucket()).add(wasteQty, wasteValue);

            String regionName = extractRegionName(batch);
            byRegion.computeIfAbsent(regionName, ignored -> new AggregateBucket()).add(wasteQty, wasteValue);

            if (batch.getExpiredAt() != null) {
                int hour = batch.getExpiredAt().getHour();
                byHour.merge(hour, wasteQty, BigDecimal::add);
            }
        }

        BigDecimal recoveryRatePct = totalReceivedQty.compareTo(BigDecimal.ZERO) > 0
                ? totalRecoveredQty.multiply(BigDecimal.valueOf(100))
                    .divide(totalReceivedQty, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        final BigDecimal totalWasteQtyFinal = totalWasteQty;

        List<AdminWasteAnalyticsResponse.WasteByCategory> topWasteCategories = byCategory.entrySet().stream()
                .sorted((a, b) -> b.getValue().qty.compareTo(a.getValue().qty))
                .limit(6)
                .map(entry -> AdminWasteAnalyticsResponse.WasteByCategory.builder()
                        .category(entry.getKey())
                        .wasteQty(entry.getValue().qty)
                        .estimatedWasteValue(entry.getValue().value)
                        .sharePct(calcSharePct(entry.getValue().qty, totalWasteQtyFinal))
                        .build())
                .toList();

        List<AdminWasteAnalyticsResponse.WasteByRegion> topWasteRegions = byRegion.entrySet().stream()
                .sorted((a, b) -> b.getValue().qty.compareTo(a.getValue().qty))
                .limit(6)
                .map(entry -> AdminWasteAnalyticsResponse.WasteByRegion.builder()
                        .region(entry.getKey())
                        .wasteQty(entry.getValue().qty)
                        .estimatedWasteValue(entry.getValue().value)
                        .sharePct(calcSharePct(entry.getValue().qty, totalWasteQtyFinal))
                        .build())
                .toList();

        List<AdminWasteAnalyticsResponse.SurplusByHour> surplusByHour = buildHourSeries(byHour);

        return AdminWasteAnalyticsResponse.builder()
                .totalWasteQty(totalWasteQty)
                .estimatedWasteValue(estimatedWasteValue)
                .totalRecoveredQty(totalRecoveredQty)
                .recoveryRatePct(recoveryRatePct)
                .affectedBatches((long) batches.size())
                .generatedAt(now)
                .topWasteCategories(topWasteCategories)
                .topWasteRegions(topWasteRegions)
                .surplusByHour(surplusByHour)
                .build();
    }

    private static String extractCategoryName(InventoryBatch batch) {
        if (batch.getVariant() != null
                && batch.getVariant().getProduct() != null
                && batch.getVariant().getProduct().getCategory() != null
                && batch.getVariant().getProduct().getCategory().getName() != null
                && !batch.getVariant().getProduct().getCategory().getName().isBlank()) {
            return batch.getVariant().getProduct().getCategory().getName().trim();
        }
        return "Khac";
    }

    private static String extractRegionName(InventoryBatch batch) {
        if (batch.getVariant() != null
                && batch.getVariant().getProduct() != null
                && batch.getVariant().getProduct().getOriginProvince() != null
                && !batch.getVariant().getProduct().getOriginProvince().isBlank()) {
            return batch.getVariant().getProduct().getOriginProvince().trim();
        }
        return "Chua ro";
    }

    private static List<AdminWasteAnalyticsResponse.SurplusByHour> buildHourSeries(Map<Integer, BigDecimal> byHour) {
        List<AdminWasteAnalyticsResponse.SurplusByHour> series = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            series.add(AdminWasteAnalyticsResponse.SurplusByHour.builder()
                    .hour(hour)
                    .label(String.format("%02d:00", hour))
                    .wasteQty(byHour.getOrDefault(hour, BigDecimal.ZERO))
                    .build());
        }
        return series;
    }

    private static List<AdminWasteAnalyticsResponse.SurplusByHour> buildEmptyHourSeries() {
        List<AdminWasteAnalyticsResponse.SurplusByHour> items = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            items.add(AdminWasteAnalyticsResponse.SurplusByHour.builder()
                    .hour(hour)
                    .label(String.format("%02d:00", hour))
                    .wasteQty(BigDecimal.ZERO)
                    .build());
        }
        return items;
    }

    private static BigDecimal calcSharePct(BigDecimal part, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return safe(part).multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static class AggregateBucket {
        private BigDecimal qty = BigDecimal.ZERO;
        private BigDecimal value = BigDecimal.ZERO;

        void add(BigDecimal qtyToAdd, BigDecimal valueToAdd) {
            qty = qty.add(safe(qtyToAdd));
            value = value.add(safe(valueToAdd));
        }
    }
}
