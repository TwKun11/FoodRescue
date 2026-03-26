package com.foodrescue.foodrescue_be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VoucherPreviewResponse {
    private String code;
    private BigDecimal orderValue;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
}