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

    @Column(name = "contact_name")
    private String contactName;

    @Column(length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "cover_url", length = 1000)
    private String coverUrl;

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
