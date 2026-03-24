package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.PlaceOrderRequest;
import com.foodrescue.foodrescue_be.dto.response.OrderResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // ---- Customer orders ----

    @PostMapping("/orders")
    public ResponseData<OrderResponse> placeOrder(
            Authentication auth,
            @RequestBody @Valid PlaceOrderRequest request
    ) {
        Long customerId = resolveCustomerId(auth);
        return ResponseData.ok("Đặt hàng thành công", orderService.placeOrder(customerId, request));
    }

    @GetMapping("/orders")
    public ResponseData<Page<OrderResponse>> myOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long customerId = resolveCustomerId(auth);
        return ResponseData.ok(orderService.getCustomerOrders(
                customerId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseData<OrderResponse> orderDetail(
            Authentication auth,
            @PathVariable Long orderId
    ) {
        Long customerId = resolveCustomerId(auth);
        return ResponseData.ok(orderService.getOrderDetail(customerId, orderId));
    }

    @PostMapping("/orders/{orderId}/payment/sync")
    public ResponseData<OrderResponse> syncOrderPayment(
            Authentication auth,
            @PathVariable Long orderId
    ) {
        Long customerId = resolveCustomerId(auth);
        return ResponseData.ok(orderService.syncOrderPaymentStatus(customerId, orderId));
    }

    // ---- Seller orders ----

    @GetMapping("/seller/orders")
    public ResponseData<Page<OrderResponse>> sellerOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Long sellerId = resolveSellerIdByEmail((String) auth.getPrincipal());
        return ResponseData.ok(orderService.getSellerOrders(
                sellerId, status, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PutMapping("/seller/orders/{sellerOrderId}/status")
    public ResponseData<OrderResponse> updateStatus(
            Authentication auth,
            @PathVariable Long sellerOrderId,
            @RequestParam String status
    ) {
        Long sellerId = resolveSellerIdByEmail((String) auth.getPrincipal());
        return ResponseData.ok("Cập nhật thành công",
                orderService.updateSellerOrderStatus(sellerId, sellerOrderId, status));
    }

    // ----

    private Long resolveCustomerId(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }

    @Autowired
    private SellerRepository sellerRepository;

    private Long resolveSellerIdByEmail(String email) {
        return sellerRepository.findByUserEmail(email)
                .map(s -> s.getId())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa được liên kết với cửa hàng"));
    }
}
