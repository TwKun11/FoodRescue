package com.foodrescue.foodrescue_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Banner quảng cáo do Seller tạo, Admin duyệt.
 * Chỉ banner APPROVED và trong khoảng startDate–endDate mới hiển thị trên trang products.
 */
@Entity
@Table(name = "banner_ads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerAd {

    public enum Status {
        PENDING,   // Chờ admin duyệt
        APPROVED,  // Đã duyệt, có thể hiển thị
        REJECTED   // Bị từ chối
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "image_url", nullable = false, length = 2000)
    private String imageUrl;

    @Column(name = "link_url", length = 2000)
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
