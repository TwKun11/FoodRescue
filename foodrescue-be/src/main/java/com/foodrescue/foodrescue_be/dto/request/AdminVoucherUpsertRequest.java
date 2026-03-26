package com.foodrescue.foodrescue_be.dto.request;

import com.foodrescue.foodrescue_be.model.Voucher;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AdminVoucherUpsertRequest {

    @NotBlank(message = "Tên voucher không được để trống")
    private String name;

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private Voucher.DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minOrderValue;

    private Integer maxUses;

    private LocalDateTime activeFrom;

    private LocalDateTime activeUntil;

    private Integer expiryHoursThreshold;

    private String targetProvince;

    private Integer comboItemThreshold;

    private Boolean autoTriggerEnabled;

    private Voucher.Status status;
}
