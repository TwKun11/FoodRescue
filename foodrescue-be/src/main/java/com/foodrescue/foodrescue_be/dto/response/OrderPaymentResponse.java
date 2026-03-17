package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.OrderPayment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderPaymentResponse {
    private String provider;
    private String status;
    private Long providerOrderCode;
    private String checkoutUrl;
    private String deepLink;
    private String qrCode;
    private BigDecimal amount;
    private String currency;
    private String description;
    private LocalDateTime expiresAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private String failureReason;

    public static OrderPaymentResponse fromEntity(OrderPayment payment) {
        if (payment == null) {
            return null;
        }
        return OrderPaymentResponse.builder()
                .provider(payment.getProvider() != null ? payment.getProvider().name() : null)
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .providerOrderCode(payment.getProviderOrderCode())
                .checkoutUrl(payment.getCheckoutUrl())
                .deepLink(payment.getDeepLink())
                .qrCode(payment.getQrCode())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .description(payment.getDescription())
                .expiresAt(payment.getExpiresAt())
                .paidAt(payment.getPaidAt())
                .cancelledAt(payment.getCancelledAt())
                .failureReason(payment.getFailureReason())
                .build();
    }
}
