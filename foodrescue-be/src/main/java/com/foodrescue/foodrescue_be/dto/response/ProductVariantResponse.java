package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.ProductVariant;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ProductVariantResponse {
    private Long id;
    private String variantCode;
    private String name;
    private String barcode;
    private String unit;
    private BigDecimal netWeightValue;
    private String netWeightUnit;
    private BigDecimal minOrderQty;
    private BigDecimal maxOrderQty;
    private BigDecimal stepQty;
    private BigDecimal listPrice;
    private BigDecimal salePrice;
    private Boolean isDefault;
    private String status;
    private BigDecimal stockAvailable;

    public static ProductVariantResponse fromEntity(ProductVariant variant, BigDecimal stockAvailable) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .variantCode(variant.getVariantCode())
                .name(variant.getName())
                .barcode(variant.getBarcode())
                .unit(variant.getUnit() != null ? variant.getUnit().name() : null)
                .netWeightValue(variant.getNetWeightValue())
                .netWeightUnit(variant.getNetWeightUnit() != null ? variant.getNetWeightUnit().name() : null)
                .minOrderQty(variant.getMinOrderQty())
                .maxOrderQty(variant.getMaxOrderQty())
                .stepQty(variant.getStepQty())
                .listPrice(variant.getListPrice())
                .salePrice(variant.getSalePrice())
                .isDefault(variant.getIsDefault())
                .status(variant.getStatus() != null ? variant.getStatus().name() : null)
                .stockAvailable(stockAvailable != null ? stockAvailable : BigDecimal.ZERO)
                .build();
    }
}
