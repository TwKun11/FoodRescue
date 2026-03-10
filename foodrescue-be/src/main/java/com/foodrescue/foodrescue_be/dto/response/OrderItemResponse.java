package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.OrderItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderItemResponse {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String variantName;
    private String variantCode;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;
    private String note;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .variantCode(item.getVariantCode())
                .unit(item.getUnit())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountAmount(item.getDiscountAmount())
                .lineTotal(item.getLineTotal())
                .note(item.getNote())
                .build();
    }
}
