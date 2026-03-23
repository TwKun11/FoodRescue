package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.PlaceOrderRequest;
import com.foodrescue.foodrescue_be.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse placeOrder(Long customerId, PlaceOrderRequest request);
    Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable);
    OrderResponse getOrderDetail(Long customerId, Long orderId);
    void handlePayOSWebhook(String payload);
    int reconcilePendingPayments();
    int expirePendingPayments();

    // Seller
    Page<OrderResponse> getSellerOrders(Long sellerId, String status, Pageable pageable);
    OrderResponse updateSellerOrderStatus(Long sellerId, Long sellerOrderId, String status);
}
