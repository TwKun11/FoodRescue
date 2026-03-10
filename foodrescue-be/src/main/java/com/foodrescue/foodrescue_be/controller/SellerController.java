package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.UpdateSellerRequest;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.SellerResponse;
import com.foodrescue.foodrescue_be.dto.response.SellerStatsResponse;
import com.foodrescue.foodrescue_be.model.OrderItem;
import com.foodrescue.foodrescue_be.model.OrderSellerOrder;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.repository.OrderItemRepository;
import com.foodrescue.foodrescue_be.repository.OrderSellerOrderRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerRepository sellerRepository;
    private final OrderSellerOrderRepository sellerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    @GetMapping("/shop")
    public ResponseData<SellerResponse> getMyShop(Authentication auth) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        return ResponseData.ok(SellerResponse.fromEntity(seller));
    }

    @PutMapping("/shop")
    public ResponseData<SellerResponse> updateShop(
            Authentication auth,
            @RequestBody UpdateSellerRequest req
    ) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        if (req.getShopName() != null && !req.getShopName().isBlank()) seller.setShopName(req.getShopName());
        if (req.getLegalName() != null) seller.setLegalName(req.getLegalName());
        if (req.getContactName() != null) seller.setContactName(req.getContactName());
        if (req.getPhone() != null) seller.setPhone(req.getPhone());
        if (req.getDescription() != null) seller.setDescription(req.getDescription());
        if (req.getAvatarUrl() != null) seller.setAvatarUrl(req.getAvatarUrl());
        if (req.getCoverUrl() != null) seller.setCoverUrl(req.getCoverUrl());
        return ResponseData.ok("Cập nhật cửa hàng thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    @GetMapping("/stats")
    public ResponseData<SellerStatsResponse> getStats(Authentication auth) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        Long sellerId = seller.getId();

        // ── All-time aggregates ─────────────────────────────────────────
        BigDecimal totalRevenue = sellerOrderRepository.sumTotalRevenueBySellerId(sellerId);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        Long totalOrders = sellerOrderRepository.countBySellerId(sellerId);
        Long completedOrders = sellerOrderRepository.countCompletedBySellerId(sellerId);
        BigDecimal avgOrderValue = completedOrders != null && completedOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // ── Daily revenue – last 7 days (completed orders) ──────────────
        LocalDateTime since7 = LocalDate.now().minusDays(6).atStartOfDay();
        List<OrderSellerOrder> recentCompleted = sellerOrderRepository.findCompletedSince(sellerId, since7);

        // Group by date
        Map<LocalDate, BigDecimal> revenueByDay = new LinkedHashMap<>();
        Map<LocalDate, Long> ordersByDay = new LinkedHashMap<>();
        for (OrderSellerOrder o : recentCompleted) {
            LocalDate d = o.getCreatedAt().toLocalDate();
            revenueByDay.merge(d, o.getTotalAmount(), BigDecimal::add);
            ordersByDay.merge(d, 1L, Long::sum);
        }

        String[] VI_DAYS = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM");
        List<SellerStatsResponse.DailyRevenue> dailyRevenue = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            dailyRevenue.add(SellerStatsResponse.DailyRevenue.builder()
                    .date(d.format(dateFmt))
                    .dayLabel(VI_DAYS[d.getDayOfWeek().getValue() % 7])
                    .revenue(revenueByDay.getOrDefault(d, BigDecimal.ZERO))
                    .orders(ordersByDay.getOrDefault(d, 0L))
                    .build());
        }

        // ── Top products – last 30 days ──────────────────────────────────
        LocalDateTime since30 = LocalDate.now().minusDays(29).atStartOfDay();
        List<OrderItem> recentItems = orderItemRepository.findCompletedItemsBySince(sellerId, since30);

        // Group by productName
        Map<String, BigDecimal[]> productMap = new LinkedHashMap<>();
        for (OrderItem item : recentItems) {
            String name = item.getProductName();
            productMap.computeIfAbsent(name, k -> new BigDecimal[]{ BigDecimal.ZERO, BigDecimal.ZERO });
            productMap.get(name)[0] = productMap.get(name)[0].add(item.getQuantity());
            productMap.get(name)[1] = productMap.get(name)[1].add(item.getLineTotal());
        }

        List<SellerStatsResponse.TopProduct> topProducts = productMap.entrySet().stream()
                .sorted((a, b) -> b.getValue()[1].compareTo(a.getValue()[1]))
                .limit(5)
                .map(e -> SellerStatsResponse.TopProduct.builder()
                        .name(e.getKey())
                        .totalQty(e.getValue()[0])
                        .totalRevenue(e.getValue()[1])
                        .build())
                .collect(Collectors.toList());

        return ResponseData.ok(SellerStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .completedOrders(completedOrders != null ? completedOrders : 0L)
                .avgOrderValue(avgOrderValue)
                .dailyRevenue(dailyRevenue)
                .topProducts(topProducts)
                .build());
    }

    private Seller resolveByEmail(String email) {
        return sellerRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa được liên kết với cửa hàng"));
    }
}
