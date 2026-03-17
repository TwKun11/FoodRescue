package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Order;
import com.foodrescue.foodrescue_be.model.OrderSellerOrder;
import com.foodrescue.foodrescue_be.model.User;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String status;          // unified: seller order status or master order status
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime paidAt;
    private OrderPaymentResponse payment;
    private List<OrderItemResponse> items;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    public static OrderResponse fromEntity(Order order, List<OrderItemResponse> items, OrderPaymentResponse payment) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getOrderStatus() != null ? order.getOrderStatus().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .confirmedAt(order.getConfirmedAt())
                .completedAt(order.getCompletedAt())
                .cancelledAt(order.getCancelledAt())
                .paidAt(order.getPaidAt())
                .payment(payment)
                .items(items)
                .build();
    }

    public static OrderResponse fromSellerOrder(OrderSellerOrder so, List<OrderItemResponse> items, OrderPaymentResponse payment) {
        Order order = so.getOrder();
        User customer = order != null ? order.getUser() : null;
        return OrderResponse.builder()
                .id(so.getId())
                .orderCode(so.getSellerOrderCode())
                .status(so.getOrderStatus() != null ? so.getOrderStatus().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .subtotal(so.getSubtotal())
                .shippingFee(so.getShippingFee())
                .discountAmount(so.getDiscountAmount())
                .totalAmount(so.getTotalAmount())
                .note(so.getNote())
                .createdAt(so.getCreatedAt())
                .confirmedAt(so.getConfirmedAt())
                .completedAt(so.getCompletedAt())
                .cancelledAt(so.getCancelledAt())
                .paidAt(order.getPaidAt())
                .payment(payment)
                .items(items)
                .customerName(customer != null ? customer.getFullName() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerPhone(customer != null ? customer.getPhone() : null)
                .build();
    }
}
