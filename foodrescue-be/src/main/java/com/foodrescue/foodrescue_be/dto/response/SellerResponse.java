package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Seller;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder(toBuilder = true)
public class SellerResponse {
    private Long id;
    private Long userId;
    private String email;
    private String code;
    private String shopName;
    private String shopSlug;
    private String legalName;
    private String businessType;
    private String contactName;
    private String phone;
    private String pickupAddress;
    private Double latitude;
    private Double longitude;
    private String taxCode;
    private String businessLicenseNumber;
    private String identityNumber;
    private String description;
    private String adminNote;
    private String avatarUrl;
    private String coverUrl;
    private String storefrontImageUrl;
    private String businessLicenseImageUrl;
    private String identityCardImageUrl;
    private String bankName;
    private String bankAccountName;
    private String bankAccountNumber;
    private String status;
    private BigDecimal ratingAvg;
    private Long reviewCount;
    private BigDecimal commissionRate;
    private Boolean isVerified;
    private String userFullName;
    private String termsVersion;
    private LocalDateTime termsAcceptedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SellerResponse fromEntity(Seller seller) {
        return SellerResponse.builder()
                .id(seller.getId())
                .userId(seller.getUser() != null ? seller.getUser().getId() : null)
                .email(seller.getUser() != null ? seller.getUser().getEmail() : null)
                .userFullName(seller.getUser() != null ? seller.getUser().getFullName() : null)
                .code(seller.getCode())
                .shopName(seller.getShopName())
                .shopSlug(seller.getShopSlug())
                .legalName(seller.getLegalName())
                .businessType(seller.getBusinessType())
                .contactName(seller.getContactName())
                .phone(seller.getPhone())
                .pickupAddress(seller.getPickupAddress())
                .latitude(seller.getLatitude())
                .longitude(seller.getLongitude())
                .taxCode(seller.getTaxCode())
                .businessLicenseNumber(seller.getBusinessLicenseNumber())
                .identityNumber(seller.getIdentityNumber())
                .description(seller.getDescription())
                .adminNote(seller.getAdminNote())
                .avatarUrl(seller.getAvatarUrl())
                .coverUrl(seller.getCoverUrl())
                .storefrontImageUrl(seller.getStorefrontImageUrl())
                .businessLicenseImageUrl(seller.getBusinessLicenseImageUrl())
                .identityCardImageUrl(seller.getIdentityCardImageUrl())
                .bankName(seller.getBankName())
                .bankAccountName(seller.getBankAccountName())
                .bankAccountNumber(seller.getBankAccountNumber())
                .status(seller.getStatus() != null ? seller.getStatus().name() : null)
                .ratingAvg(seller.getRatingAvg())
                .commissionRate(seller.getCommissionRate())
                .isVerified(seller.getIsVerified())
                .termsVersion(seller.getTermsVersion())
                .termsAcceptedAt(seller.getTermsAcceptedAt())
                .reviewedAt(seller.getReviewedAt())
                .createdAt(seller.getCreatedAt())
                .updatedAt(seller.getUpdatedAt())
                .build();
    }
}
