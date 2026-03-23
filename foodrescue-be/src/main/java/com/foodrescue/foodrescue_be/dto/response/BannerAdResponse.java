package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.BannerAd;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BannerAdResponse {

    private Long id;
    private Long sellerId;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String rejectReason;
    private LocalDateTime createdAt;

    public static BannerAdResponse fromEntity(BannerAd ad) {
        return BannerAdResponse.builder()
                .id(ad.getId())
                .sellerId(ad.getSellerId())
                .title(ad.getTitle())
                .imageUrl(ad.getImageUrl())
                .linkUrl(ad.getLinkUrl())
                .status(ad.getStatus() != null ? ad.getStatus().name() : null)
                .startDate(ad.getStartDate())
                .endDate(ad.getEndDate())
                .rejectReason(ad.getRejectReason())
                .createdAt(ad.getCreatedAt())
                .build();
    }
}
