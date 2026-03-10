package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateBatchRequest {

    @NotNull(message = "Biến thể sản phẩm không được để trống")
    private Long variantId;

    @NotBlank(message = "Mã lô không được để trống")
    private String batchCode;

    private String supplierName;

    @NotNull(message = "Ngày nhập không được để trống")
    private LocalDateTime receivedAt;

    private LocalDateTime manufacturedAt;
    private LocalDateTime expiredAt;

    @NotNull(message = "Giá vốn không được để trống")
    private BigDecimal costPrice;

    @NotNull(message = "Số lượng nhập không được để trống")
    private BigDecimal quantityReceived;

    private String note;
}
