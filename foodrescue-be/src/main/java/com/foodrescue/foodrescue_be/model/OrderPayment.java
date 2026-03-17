package com.foodrescue.foodrescue_be.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "order_payments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_order_payments_order_id", columnNames = "order_id"),
                @UniqueConstraint(name = "uk_order_payments_provider_order_code", columnNames = "provider_order_code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPayment {

    public enum PaymentProvider { payos }
    public enum PaymentTransactionStatus { pending, paid, cancelled, expired, failed, refunded }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 50)
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 50)
    private PaymentTransactionStatus status;

    @Column(name = "provider_order_code", nullable = false)
    private Long providerOrderCode;

    @Column(name = "provider_payment_link_id", length = 100)
    private String providerPaymentLinkId;

    @Column(name = "checkout_url", length = 1000)
    private String checkoutUrl;

    @Column(name = "deep_link", length = 1000)
    private String deepLink;

    @Lob
    @Column(name = "qr_code", columnDefinition = "LONGTEXT")
    private String qrCode;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(length = 255)
    private String description;

    @Column(name = "provider_reference", length = 255)
    private String providerReference;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "last_webhook_at")
    private LocalDateTime lastWebhookAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
