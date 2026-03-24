package com.foodrescue.foodrescue_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    public enum Status { pending, active, suspended, closed }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(name = "shop_slug", nullable = false, unique = true)
    private String shopSlug;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(name = "contact_name")
    private String contactName;

    @Column(length = 30)
    private String phone;

    @Column(name = "pickup_address", columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "business_license_number", length = 100)
    private String businessLicenseNumber;

    @Column(name = "identity_number", length = 50)
    private String identityNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "cover_url", length = 1000)
    private String coverUrl;

    @Column(name = "storefront_image_url", length = 1000)
    private String storefrontImageUrl;

    @Column(name = "business_license_image_url", length = 1000)
    private String businessLicenseImageUrl;

    @Column(name = "identity_card_image_url", length = 1000)
    private String identityCardImageUrl;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "bank_account_name", length = 255)
    private String bankAccountName;

    @Column(name = "bank_account_number", length = 100)
    private String bankAccountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.pending;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(name = "rating_avg", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAvg = BigDecimal.ZERO;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "terms_accepted_at")
    private LocalDateTime termsAcceptedAt;

    @Column(name = "terms_version", length = 50)
    private String termsVersion;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = Status.pending;
        if (commissionRate == null) commissionRate = BigDecimal.ZERO;
        if (ratingAvg == null) ratingAvg = BigDecimal.ZERO;
        if (isVerified == null) isVerified = false;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
