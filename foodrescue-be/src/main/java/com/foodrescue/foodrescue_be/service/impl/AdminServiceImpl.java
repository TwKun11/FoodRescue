package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.response.AdminWasteAnalyticsResponse;
import com.foodrescue.foodrescue_be.dto.response.AdminStatsResponse;
import com.foodrescue.foodrescue_be.model.InventoryBatch;
import com.foodrescue.foodrescue_be.model.Order;
import com.foodrescue.foodrescue_be.model.OrderItem;
import com.foodrescue.foodrescue_be.model.Product;
import com.foodrescue.foodrescue_be.model.ProductImage;
import com.foodrescue.foodrescue_be.repository.InventoryBatchRepository;
import com.foodrescue.foodrescue_be.repository.OrderItemRepository;
import com.foodrescue.foodrescue_be.repository.OrderRepository;
import com.foodrescue.foodrescue_be.repository.ProductImageRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final int DEFAULT_ACTION_ITEMS_LIMIT = 5;

    private final InventoryBatchRepository inventoryBatchRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SellerRepository sellerRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public AdminWasteAnalyticsResponse getWasteAnalytics() {
        return getWasteAnalytics(DEFAULT_ACTION_ITEMS_LIMIT, false);
    }

    @Override
    public AdminWasteAnalyticsResponse getWasteAnalytics(Integer actionItemsLimit, boolean full) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime horizon72h = now.plusHours(72);
        List<InventoryBatch> batches = inventoryBatchRepository.findExpiredBatchesWithRemainingQty(now);
        List<InventoryBatch> actionableBatches = inventoryBatchRepository.findActionableBatchesUntil(horizon72h);

        int effectiveLimit;
        if (full) {
            effectiveLimit = Integer.MAX_VALUE;
        } else if (actionItemsLimit == null || actionItemsLimit <= 0) {
            effectiveLimit = DEFAULT_ACTION_ITEMS_LIMIT;
        } else {
            effectiveLimit = actionItemsLimit;
        }

        AdminWasteAnalyticsResponse.EarlyWarningSummary earlyWarning = buildEarlyWarningSummary(actionableBatches, now);
        List<AdminWasteAnalyticsResponse.WasteActionItem> wasteActionItems = buildWasteActionItems(actionableBatches, now, effectiveLimit);
        List<AdminWasteAnalyticsResponse.SmartMatchingSuggestion> smartMatchingSuggestions = buildSmartMatchingSuggestions(actionableBatches, now);

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
                    .topWasteProducts(List.of())
                    .earlyWarning(earlyWarning)
                    .wasteActionItems(wasteActionItems)
                    .smartMatchingSuggestions(smartMatchingSuggestions)
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
        Map<Long, ProductWasteBucket> byProduct = new HashMap<>();
        Set<Long> productIds = new HashSet<>();

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

            Product product = batch.getVariant() != null ? batch.getVariant().getProduct() : null;
            if (product != null && product.getId() != null) {
                byProduct.computeIfAbsent(product.getId(), ignored -> ProductWasteBucket.from(product))
                        .add(wasteQty, wasteValue, batch.getExpiredAt());
                productIds.add(product.getId());
            }

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

                Map<Long, String> productImageMap = resolvePrimaryImageByProductIds(productIds);

                List<AdminWasteAnalyticsResponse.WasteProduct> topWasteProducts = byProduct.values().stream()
                    .sorted((a, b) -> {
                        int byQty = b.getQty().compareTo(a.getQty());
                        if (byQty != 0) {
                        return byQty;
                        }
                        return b.getValue().compareTo(a.getValue());
                    })
                    .map(bucket -> AdminWasteAnalyticsResponse.WasteProduct.builder()
                        .productId(bucket.productId)
                        .productName(bucket.productName)
                        .productCode(bucket.productCode)
                        .category(bucket.category)
                        .originProvince(bucket.originProvince)
                        .imageUrl(productImageMap.get(bucket.productId))
                        .wasteQty(bucket.qty)
                        .estimatedWasteValue(bucket.value)
                        .sharePct(calcSharePct(bucket.qty, totalWasteQtyFinal))
                        .latestExpiredAt(bucket.latestExpiredAt)
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
                .topWasteProducts(topWasteProducts)
                .earlyWarning(earlyWarning)
                .wasteActionItems(wasteActionItems)
                .smartMatchingSuggestions(smartMatchingSuggestions)
                .surplusByHour(surplusByHour)
                .build();
    }

    private AdminWasteAnalyticsResponse.EarlyWarningSummary buildEarlyWarningSummary(List<InventoryBatch> batches, LocalDateTime now) {
        if (batches == null || batches.isEmpty()) {
            return AdminWasteAnalyticsResponse.EarlyWarningSummary.builder()
                    .expiredNowCount(0L)
                    .expiringIn24hCount(0L)
                    .expiringIn48hCount(0L)
                    .expiringIn72hCount(0L)
                    .atRiskQty(BigDecimal.ZERO)
                    .atRiskValue(BigDecimal.ZERO)
                    .build();
        }

        long expiredNow = 0L;
        long in24h = 0L;
        long in48h = 0L;
        long in72h = 0L;
        BigDecimal atRiskQty = BigDecimal.ZERO;
        BigDecimal atRiskValue = BigDecimal.ZERO;

        for (InventoryBatch batch : batches) {
            if (batch.getExpiredAt() == null) {
                continue;
            }
            BigDecimal qty = safe(batch.getQuantityAvailable());
            BigDecimal value = qty.multiply(safe(batch.getCostPrice()));
            atRiskQty = atRiskQty.add(qty);
            atRiskValue = atRiskValue.add(value);

            if (!batch.getExpiredAt().isAfter(now)) {
                expiredNow++;
            } else if (!batch.getExpiredAt().isAfter(now.plusHours(24))) {
                in24h++;
            } else if (!batch.getExpiredAt().isAfter(now.plusHours(48))) {
                in48h++;
            } else if (!batch.getExpiredAt().isAfter(now.plusHours(72))) {
                in72h++;
            }
        }

        return AdminWasteAnalyticsResponse.EarlyWarningSummary.builder()
                .expiredNowCount(expiredNow)
                .expiringIn24hCount(in24h)
                .expiringIn48hCount(in48h)
                .expiringIn72hCount(in72h)
                .atRiskQty(atRiskQty)
                .atRiskValue(atRiskValue)
                .build();
    }

    private List<AdminWasteAnalyticsResponse.WasteActionItem> buildWasteActionItems(List<InventoryBatch> batches, LocalDateTime now, int limit) {
        if (batches == null || batches.isEmpty()) {
            return List.of();
        }

        Set<Long> productIds = batches.stream()
                .map(b -> b.getVariant() != null ? b.getVariant().getProduct() : null)
                .filter(p -> p != null && p.getId() != null)
                .map(Product::getId)
                .collect(Collectors.toSet());

        Map<Long, String> imageByProduct = resolvePrimaryImageByProductIds(productIds);

        return batches.stream()
                .filter(b -> b.getExpiredAt() != null)
                .map(batch -> toWasteActionItem(batch, now, imageByProduct))
                .filter(item -> item != null && item.getHoursToExpire() > -24)  // Only items expired max 24h ago
                .sorted((a, b) -> {
                    int byPriority = Integer.compare(priorityRank(a.getPriority()), priorityRank(b.getPriority()));
                    if (byPriority != 0) {
                        return byPriority;
                    }
                    int byValue = safe(b.getEstimatedValue()).compareTo(safe(a.getEstimatedValue()));
                    if (byValue != 0) {
                        return byValue;
                    }
                    return Long.compare(safeLong(a.getHoursToExpire()), safeLong(b.getHoursToExpire()));
                })
                .limit(Math.max(limit, 0))
                .toList();
    }

    private AdminWasteAnalyticsResponse.WasteActionItem toWasteActionItem(
            InventoryBatch batch,
            LocalDateTime now,
            Map<Long, String> imageByProduct
    ) {
        Product product = batch.getVariant() != null ? batch.getVariant().getProduct() : null;
        Long productId = product != null ? product.getId() : null;
        BigDecimal qty = safe(batch.getQuantityAvailable());
        BigDecimal value = qty.multiply(safe(batch.getCostPrice()));

        long hoursToExpire = Duration.between(now, batch.getExpiredAt()).toHours();
        String priority;
        String action;
        String reason;

        if (hoursToExpire <= 0) {
            priority = "critical";
            action = "Đề xuất tặng";
            reason = "Lô đã quá hạn, cần xử lý ngay để giảm hủy bỏ";
        } else if (hoursToExpire <= 24) {
            priority = "high";
            action = "Giảm giá";
            reason = "Còn dưới 24 giờ đến hạn, nên kích cầu bán nhanh";
        } else if (hoursToExpire <= 48) {
            priority = "medium";
            action = "Giảm giá + Gợi ý combo";
            reason = "Còn dưới 48 giờ, cần thúc đẩy tiêu thụ theo gói";
        } else {
            priority = "watch";
            action = "Gợi ý combo";
            reason = "Còn dưới 72 giờ, nên tạo chiến dịch bán sớm";
        }

        return AdminWasteAnalyticsResponse.WasteActionItem.builder()
                .batchId(batch.getId())
                .batchCode(batch.getBatchCode())
                .productId(productId)
                .productName(product != null ? product.getName() : "Khong ro")
                .productCode(product != null ? product.getProductCode() : null)
                .category(product != null && product.getCategory() != null ? product.getCategory().getName() : "Khac")
                .sellerName(batch.getSeller() != null ? batch.getSeller().getShopName() : "Khong ro")
                .imageUrl(productId != null ? imageByProduct.get(productId) : null)
                .expiredAt(batch.getExpiredAt())
                .hoursToExpire(hoursToExpire)
                .quantityAvailable(qty)
                .estimatedValue(value)
                .recommendedAction(action)
                .priority(priority)
                .reason(reason)
                .build();
    }

    private List<AdminWasteAnalyticsResponse.SmartMatchingSuggestion> buildSmartMatchingSuggestions(
            List<InventoryBatch> actionableBatches,
            LocalDateTime now
    ) {
        if (actionableBatches == null || actionableBatches.isEmpty()) {
            return List.of();
        }

        LocalDateTime since = now.minusDays(30);
        List<OrderItem> completedItems = orderItemRepository.findCompletedItemsWithDemandContextSince(since);
        if (completedItems.isEmpty()) {
            return List.of();
        }

        Map<DemandKey, BigDecimal> demandByCategoryProvinceHour = new HashMap<>();
        for (OrderItem item : completedItems) {
            if (item.getOrder() == null || item.getOrder().getAddress() == null || item.getProduct() == null) {
                continue;
            }
            String province = normalizeProvinceName(item.getOrder().getAddress().getProvince());
            String category = item.getProduct().getCategory() != null
                    ? safeText(item.getProduct().getCategory().getName())
                    : "Khác";
            int hour = item.getCreatedAt() != null ? item.getCreatedAt().getHour() : 18;
            BigDecimal qty = safe(item.getQuantity());
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            demandByCategoryProvinceHour.merge(new DemandKey(category, province, hour), qty, BigDecimal::add);
        }

        if (demandByCategoryProvinceHour.isEmpty()) {
            return List.of();
        }

        Map<String, BigDecimal> demandByProvince = new HashMap<>();
        for (Map.Entry<DemandKey, BigDecimal> entry : demandByCategoryProvinceHour.entrySet()) {
            String province = normalizeProvinceName(entry.getKey().province);
            demandByProvince.merge(province, safe(entry.getValue()), BigDecimal::add);
        }

        List<String> rankedProvinces = demandByProvince.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        Set<Long> productIds = actionableBatches.stream()
                .map(b -> b.getVariant() != null ? b.getVariant().getProduct() : null)
                .filter(p -> p != null && p.getId() != null)
                .map(Product::getId)
                .collect(Collectors.toSet());
        Map<Long, String> productImageMap = resolvePrimaryImageByProductIds(productIds);

        return actionableBatches.stream()
                .filter(b -> b.getVariant() != null && b.getVariant().getProduct() != null)
            .map(batch -> buildSuggestionForBatch(batch, now, demandByCategoryProvinceHour, rankedProvinces, productImageMap))
                .filter(s -> s != null)
                .sorted((a, b) -> Integer.compare(safeInt(b.getConfidenceScore()), safeInt(a.getConfidenceScore())))
                .limit(10)
                .toList();
    }

    private AdminWasteAnalyticsResponse.SmartMatchingSuggestion buildSuggestionForBatch(
            InventoryBatch batch,
            LocalDateTime now,
            Map<DemandKey, BigDecimal> demandMap,
            List<String> rankedProvinces,
            Map<Long, String> productImageMap
    ) {
        Product product = batch.getVariant().getProduct();
        String category = product.getCategory() != null ? safeText(product.getCategory().getName()) : "Khác";

        String preferredProvince = pickProvinceForBatch(batch, rankedProvinces);
        DemandKey best = pickBestDemandKeyForProvince(preferredProvince, category, demandMap);

        if (best == null) {
            return null;
        }

        BigDecimal demandScore = demandMap.getOrDefault(best, BigDecimal.ZERO);
        String hourLabel = String.format("%02d:00", best.hour);
        long hoursToExpire = Duration.between(now, batch.getExpiredAt()).toHours();
        int confidence = computeConfidence(batch, best, demandScore, hoursToExpire);

        String suggestionText = String.format(
                "%s đang dư %s, nên đẩy tới khu vực %s lúc %s",
                batch.getSeller() != null ? safeText(batch.getSeller().getShopName()) : "Cửa hàng",
                safeText(product.getName()),
            normalizeProvinceName(best.province),
                hourLabel
        );

        String basis = String.format(
                "Nhu cầu %s tại %s-%s cao trong 30 ngày gần nhất, lô còn %s và còn %d giờ đến hạn",
                category,
            normalizeProvinceName(best.province),
                hourLabel,
                fmtQtyShort(batch.getQuantityAvailable()),
                hoursToExpire
        );

        return AdminWasteAnalyticsResponse.SmartMatchingSuggestion.builder()
                .batchId(batch.getId())
                .batchCode(batch.getBatchCode())
            .sellerName(batch.getSeller() != null ? safeText(batch.getSeller().getShopName()) : "Không rõ")
                .productId(product.getId())
                .productName(safeText(product.getName()))
                .category(category)
                .targetProvince(normalizeProvinceName(best.province))
                .suggestedTimeSlot(hourLabel)
                .quantityAvailable(safe(batch.getQuantityAvailable()))
                .estimatedValue(safe(batch.getQuantityAvailable()).multiply(safe(batch.getCostPrice())))
                .confidenceScore(confidence)
                .suggestionText(suggestionText)
                .basis(basis)
                .build();
    }

    private static int computeConfidence(InventoryBatch batch, DemandKey key, BigDecimal demandScore, long hoursToExpire) {
        int demandBoost = Math.min(20, safe(demandScore).intValue());
        int urgencyBoost = hoursToExpire <= 12 ? 14 : hoursToExpire <= 24 ? 11 : hoursToExpire <= 48 ? 8 : 5;
        long seed = batch.getId() != null ? batch.getId() : (batch.getBatchCode() != null ? batch.getBatchCode().hashCode() : 0);
        int provinceJitter = Math.floorMod((int) (seed * 17 + key.province.hashCode()), 12) - 6;
        int hourJitter = Math.floorMod((int) (seed * 31 + key.hour * 7), 11) - 5;
        return Math.max(52, Math.min(96, 56 + demandBoost + urgencyBoost + provinceJitter + hourJitter));
    }

    private static String pickProvinceForBatch(InventoryBatch batch, List<String> rankedProvinces) {
        if (rankedProvinces == null || rankedProvinces.isEmpty()) {
            return null;
        }
        long seed = batch.getId() != null ? batch.getId() : (batch.getBatchCode() != null ? batch.getBatchCode().hashCode() : 0);
        int topWindow = Math.min(5, rankedProvinces.size());
        int index = Math.floorMod((int) (seed * 13 + 7), topWindow);
        return rankedProvinces.get(index);
    }

    private static DemandKey pickBestDemandKeyForProvince(
            String province,
            String category,
            Map<DemandKey, BigDecimal> demandMap
    ) {
        if (demandMap == null || demandMap.isEmpty()) {
            return null;
        }

        if (province != null && !province.isBlank()) {
            DemandKey bestInProvinceAndCategory = demandMap.entrySet().stream()
                    .filter(e -> normalizeProvinceName(e.getKey().province).equalsIgnoreCase(province))
                    .filter(e -> category.equalsIgnoreCase(e.getKey().category))
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            if (bestInProvinceAndCategory != null) {
                return bestInProvinceAndCategory;
            }

            DemandKey bestInProvinceAnyCategory = demandMap.entrySet().stream()
                    .filter(e -> normalizeProvinceName(e.getKey().province).equalsIgnoreCase(province))
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            if (bestInProvinceAnyCategory != null) {
                return bestInProvinceAnyCategory;
            }
        }

        return demandMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private static int priorityRank(String p) {
        if (p == null) return 99;
        return switch (p) {
            case "critical" -> 0;
            case "high" -> 1;
            case "medium" -> 2;
            case "watch" -> 3;
            default -> 99;
        };
    }

    private static long safeLong(Long val) {
        return val != null ? val : Long.MAX_VALUE;
    }

    @Override
    public AdminStatsResponse getAdminStats() {
        LocalDateTime now = LocalDateTime.now();

        long totalOrders = safeLong(orderRepository.countAllOrdersRaw());
        long completedOrders = safeLong(orderRepository.countCompletedOrdersRaw());
        BigDecimal totalRevenue = safe(orderRepository.sumCompletedRevenueRaw());

        // Calculate average order value
        BigDecimal avgOrderValue = completedOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Calculate monthly revenue for current year (12 months)
        List<BigDecimal> monthlyRevenue = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();
        Map<Integer, BigDecimal> byMonth = new HashMap<>();

        List<Order> completedOrdersInYear = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() == Order.OrderStatus.completed)
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear)
                .toList();

        for (Order order : completedOrdersInYear) {
            int month = order.getCreatedAt().getMonthValue();
            BigDecimal total = safe(order.getTotalAmount());
            byMonth.merge(month, total, BigDecimal::add);
        }

        for (int month = 1; month <= 12; month++) {
            monthlyRevenue.add(byMonth.getOrDefault(month, BigDecimal.ZERO));
        }

        // Count sellers
        long totalSellers = sellerRepository.count();
        long activeSellers = sellerRepository.countByStatus(com.foodrescue.foodrescue_be.model.Seller.Status.active);
        
        return AdminStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .avgOrderValue(avgOrderValue)
                .monthlyRevenue(monthlyRevenue)
                .totalSellers(totalSellers)
                .activeSellers(activeSellers)
                .generatedAt(now)
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

    private static String safeText(String value) {
        if (value == null || value.isBlank()) {
            return "Không rõ";
        }
        return value.trim();
    }

    private static int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private static String fmtQtyShort(BigDecimal qty) {
        return safe(qty).stripTrailingZeros().toPlainString() + " đơn vị";
    }

    private static String normalizeProvinceName(String value) {
        String raw = safeText(value);
        String normalized = java.text.Normalizer.normalize(raw, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replace('.', ' ')
                .trim()
                .replaceAll("\\s+", " ");

        return switch (normalized) {
            case "ho chi minh", "tp ho chi minh", "tphcm", "tp hcm", "hcm" -> "TP. Hồ Chí Minh";
            case "ha noi", "hn" -> "Hà Nội";
            case "da nang" -> "Đà Nẵng";
            case "can tho" -> "Cần Thơ";
            case "hai phong" -> "Hải Phòng";
            case "hue", "thua thien hue" -> "Huế";
            case "da lat" -> "Đà Lạt";
            case "lam dong" -> "Lâm Đồng";
            default -> raw;
        };
    }

    private Map<Long, String> resolvePrimaryImageByProductIds(Set<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }

        List<ProductImage> images = productImageRepository.findByProductIdInOrderBySortOrderAsc(new ArrayList<>(productIds));
        Map<Long, List<ProductImage>> imagesByProduct = images.stream()
                .filter(img -> img.getProduct() != null && img.getProduct().getId() != null)
                .collect(Collectors.groupingBy(img -> img.getProduct().getId()));

        Map<Long, String> imageMap = new HashMap<>();
        for (Map.Entry<Long, List<ProductImage>> entry : imagesByProduct.entrySet()) {
            String url = entry.getValue().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElseGet(() -> entry.getValue().stream()
                            .map(ProductImage::getImageUrl)
                            .findFirst()
                            .orElse(null));
            imageMap.put(entry.getKey(), url);
        }
        return imageMap;
    }

    private static class DemandKey {
        private final String category;
        private final String province;
        private final int hour;

        private DemandKey(String category, String province, int hour) {
            this.category = category;
            this.province = province;
            this.hour = hour;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            DemandKey demandKey = (DemandKey) o;
            return hour == demandKey.hour
                    && category.equals(demandKey.category)
                    && province.equals(demandKey.province);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(category, province, hour);
        }
    }

    private static class AggregateBucket {
        private BigDecimal qty = BigDecimal.ZERO;
        private BigDecimal value = BigDecimal.ZERO;

        void add(BigDecimal qtyToAdd, BigDecimal valueToAdd) {
            qty = qty.add(safe(qtyToAdd));
            value = value.add(safe(valueToAdd));
        }
    }

    private static class ProductWasteBucket {
        private Long productId;
        private String productName;
        private String productCode;
        private String category;
        private String originProvince;
        private BigDecimal qty = BigDecimal.ZERO;
        private BigDecimal value = BigDecimal.ZERO;
        private LocalDateTime latestExpiredAt;

        static ProductWasteBucket from(Product product) {
            ProductWasteBucket bucket = new ProductWasteBucket();
            bucket.productId = product.getId();
            bucket.productName = product.getName();
            bucket.productCode = product.getProductCode();
            bucket.category = product.getCategory() != null ? product.getCategory().getName() : "Khac";
            bucket.originProvince = product.getOriginProvince();
            return bucket;
        }

        void add(BigDecimal qtyToAdd, BigDecimal valueToAdd, LocalDateTime expiredAt) {
            qty = qty.add(safe(qtyToAdd));
            value = value.add(safe(valueToAdd));
            if (expiredAt != null && (latestExpiredAt == null || expiredAt.isAfter(latestExpiredAt))) {
                latestExpiredAt = expiredAt;
            }
        }

        BigDecimal getQty() {
            return qty;
        }

        BigDecimal getValue() {
            return value;
        }
    }
}
