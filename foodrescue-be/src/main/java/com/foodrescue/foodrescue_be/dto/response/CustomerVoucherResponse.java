package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.UserVoucher;
import com.foodrescue.foodrescue_be.model.Voucher;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerVoucherResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer maxUses;
    private Integer usedCount;
    private LocalDateTime activeFrom;
    private LocalDateTime activeUntil;
    private String status;
    private boolean claimed;
    private LocalDateTime claimedAt;
    private LocalDateTime usedAt;

    public static CustomerVoucherResponse from(Voucher voucher, UserVoucher userVoucher) {
        return CustomerVoucherResponse.builder()
                .id(voucher.getId())
                .name(voucher.getName())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType() != null ? voucher.getDiscountType().name() : null)
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .maxUses(voucher.getMaxUses())
                .usedCount(voucher.getUsedCount())
                .activeFrom(voucher.getActiveFrom())
                .activeUntil(voucher.getActiveUntil())
                .status(voucher.getStatus() != null ? voucher.getStatus().name() : null)
                .claimed(userVoucher != null)
                .claimedAt(userVoucher != null ? userVoucher.getClaimedAt() : null)
                .usedAt(userVoucher != null ? userVoucher.getUsedAt() : null)
                .build();
    }
}