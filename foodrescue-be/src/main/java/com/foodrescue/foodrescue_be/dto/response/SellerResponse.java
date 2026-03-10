package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Seller;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class SellerResponse {
    private Long id;
    private Long userId;
    private String email;
    private String code;
    private String shopName;
    private String shopSlug;
    private String legalName;
    private String contactName;
    private String phone;
    private String description;
    private String avatarUrl;
    private String coverUrl;
    private String status;
    private BigDecimal ratingAvg;
    private BigDecimal commissionRate;
    private Boolean isVerified;

    public static SellerResponse fromEntity(Seller seller) {
        return SellerResponse.builder()
                .id(seller.getId())
                .userId(seller.getUser() != null ? seller.getUser().getId() : null)
                .email(seller.getUser() != null ? seller.getUser().getEmail() : null)
                .code(seller.getCode())
                .shopName(seller.getShopName())
                .shopSlug(seller.getShopSlug())
                .legalName(seller.getLegalName())
                .contactName(seller.getContactName())
                .phone(seller.getPhone())
                .description(seller.getDescription())
                .avatarUrl(seller.getAvatarUrl())
                .coverUrl(seller.getCoverUrl())
                .status(seller.getStatus() != null ? seller.getStatus().name() : null)
                .ratingAvg(seller.getRatingAvg())
                .commissionRate(seller.getCommissionRate())
                .isVerified(seller.getIsVerified())
                .build();
    }
}
