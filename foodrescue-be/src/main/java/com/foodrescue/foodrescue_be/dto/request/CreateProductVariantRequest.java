package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateProductVariantRequest {

    @NotBlank(message = "Mã biến thể không được để trống")
    private String variantCode;

    @NotBlank(message = "Tên biến thể không được để trống")
    private String name;

    private String barcode;

    @NotBlank(message = "Đơn vị không được để trống")
    private String unit;

    private BigDecimal netWeightValue;
    private String netWeightUnit;

    @NotNull(message = "Số lượng đặt tối thiểu không được để trống")
    private BigDecimal minOrderQty;

    private BigDecimal maxOrderQty;

    @NotNull(message = "Bước đặt hàng không được để trống")
    private BigDecimal stepQty;

    private BigDecimal listPrice;
    private BigDecimal salePrice;
    private BigDecimal costPrice;

    private Boolean isDefault = false;
    private Boolean requiresBatch = true;
    private Boolean trackInventory = true;
    private String status;
}
