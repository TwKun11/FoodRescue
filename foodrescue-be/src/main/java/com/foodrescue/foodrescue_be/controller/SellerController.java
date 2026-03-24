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
import com.foodrescue.foodrescue_be.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerRepository sellerRepository;
    private final OrderSellerOrderRepository sellerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/shop")
    public ResponseData<SellerResponse> getMyShop(Authentication auth) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        return ResponseData.ok(SellerResponse.fromEntity(seller));
    }

    @PutMapping("/shop")
    @Transactional
    public ResponseData<SellerResponse> updateShop(
            Authentication auth,
            @Valid @RequestBody UpdateSellerRequest req
    ) {
        String email = String.valueOf(auth.getPrincipal());
        Seller seller = resolveByEmail(email);

        if (req.getShopName() != null && !req.getShopName().isBlank()) {
            seller.setShopName(req.getShopName().trim());
        }
        if (req.getLegalName() != null) seller.setLegalName(cleanNullable(req.getLegalName()));
        if (req.getBusinessType() != null) seller.setBusinessType(cleanNullable(req.getBusinessType()));
        if (req.getContactName() != null) seller.setContactName(cleanNullable(req.getContactName()));
        if (req.getPhone() != null) seller.setPhone(cleanNullable(req.getPhone()));
        if (req.getPickupAddress() != null) seller.setPickupAddress(cleanNullable(req.getPickupAddress()));
        if (req.getLatitude() != null) seller.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) seller.setLongitude(req.getLongitude());
        if (req.getTaxCode() != null) seller.setTaxCode(cleanNullable(req.getTaxCode()));
        if (req.getBusinessLicenseNumber() != null) seller.setBusinessLicenseNumber(cleanNullable(req.getBusinessLicenseNumber()));
        if (req.getIdentityNumber() != null) seller.setIdentityNumber(cleanNullable(req.getIdentityNumber()));
        if (req.getDescription() != null) seller.setDescription(cleanNullable(req.getDescription()));
        if (req.getAvatarUrl() != null) seller.setAvatarUrl(cleanNullable(req.getAvatarUrl()));
        if (req.getCoverUrl() != null) seller.setCoverUrl(cleanNullable(req.getCoverUrl()));
        if (req.getStorefrontImageUrl() != null) seller.setStorefrontImageUrl(cleanNullable(req.getStorefrontImageUrl()));
        if (req.getBusinessLicenseImageUrl() != null) seller.setBusinessLicenseImageUrl(cleanNullable(req.getBusinessLicenseImageUrl()));
        if (req.getIdentityCardImageUrl() != null) seller.setIdentityCardImageUrl(cleanNullable(req.getIdentityCardImageUrl()));
        if (req.getBankName() != null) seller.setBankName(cleanNullable(req.getBankName()));
        if (req.getBankAccountName() != null) seller.setBankAccountName(cleanNullable(req.getBankAccountName()));
        if (req.getBankAccountNumber() != null) seller.setBankAccountNumber(cleanNullable(req.getBankAccountNumber()));

        sellerRepository.save(seller);
        Seller refreshed = resolveByEmail(email);
        return ResponseData.ok("Cap nhat cua hang thanh cong", SellerResponse.fromEntity(refreshed));
    }

    @PostMapping("/shop/upload")
    public ResponseData<String> uploadShopImage(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) {
        resolveByEmail((String) auth.getPrincipal());
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File khong duoc de trong");
        }
        return ResponseData.ok(
                "Tai anh thanh cong",
                cloudinaryService.uploadImage(file, "foodrescue/sellers")
        );
    }

    @GetMapping("/stats")
    public ResponseData<SellerStatsResponse> getStats(Authentication auth) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        Long sellerId = seller.getId();

        BigDecimal totalRevenue = sellerOrderRepository.sumTotalRevenueBySellerId(sellerId);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        Long totalOrders = sellerOrderRepository.countBySellerId(sellerId);
        Long completedOrders = sellerOrderRepository.countCompletedBySellerId(sellerId);
        BigDecimal avgOrderValue = completedOrders != null && completedOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        LocalDateTime since7 = LocalDate.now().minusDays(6).atStartOfDay();
        List<OrderSellerOrder> recentCompleted = sellerOrderRepository.findCompletedSince(sellerId, since7);

        Map<LocalDate, BigDecimal> revenueByDay = new LinkedHashMap<>();
        Map<LocalDate, Long> ordersByDay = new LinkedHashMap<>();
        for (OrderSellerOrder order : recentCompleted) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            revenueByDay.merge(date, order.getTotalAmount(), BigDecimal::add);
            ordersByDay.merge(date, 1L, Long::sum);
        }

        String[] viDays = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM");
        List<SellerStatsResponse.DailyRevenue> dailyRevenue = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            dailyRevenue.add(SellerStatsResponse.DailyRevenue.builder()
                    .date(date.format(dateFmt))
                    .dayLabel(viDays[date.getDayOfWeek().getValue() % 7])
                    .revenue(revenueByDay.getOrDefault(date, BigDecimal.ZERO))
                    .orders(ordersByDay.getOrDefault(date, 0L))
                    .build());
        }

        LocalDateTime since30 = LocalDate.now().minusDays(29).atStartOfDay();
        List<OrderItem> recentItems = orderItemRepository.findCompletedItemsBySince(sellerId, since30);

        Map<String, BigDecimal[]> productMap = new LinkedHashMap<>();
        for (OrderItem item : recentItems) {
            String name = item.getProductName();
            productMap.computeIfAbsent(name, key -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            productMap.get(name)[0] = productMap.get(name)[0].add(item.getQuantity());
            productMap.get(name)[1] = productMap.get(name)[1].add(item.getLineTotal());
        }

        List<SellerStatsResponse.TopProduct> topProducts = productMap.entrySet().stream()
                .sorted((a, b) -> b.getValue()[1].compareTo(a.getValue()[1]))
                .limit(5)
                .map(entry -> SellerStatsResponse.TopProduct.builder()
                        .name(entry.getKey())
                        .totalQty(entry.getValue()[0])
                        .totalRevenue(entry.getValue()[1])
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
                .orElseThrow(() -> new IllegalArgumentException("Tai khoan chua duoc lien ket voi cua hang"));
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
