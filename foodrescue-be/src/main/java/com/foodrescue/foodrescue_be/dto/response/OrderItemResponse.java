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
    private String primaryImageUrl;
    private String productName;
    private String variantName;
    private String variantCode;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal listPrice;
    private BigDecimal unitPrice;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;
    private String note;

    public static OrderItemResponse fromEntity(OrderItem item, String primaryImageUrl) {
        BigDecimal listPrice = item.getListPrice();
        if (listPrice == null && item.getVariant() != null) {
            listPrice = item.getVariant().getListPrice();
        }
        return OrderItemResponse.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .primaryImageUrl(primaryImageUrl)
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .variantCode(item.getVariantCode())
                .unit(item.getUnit())
                .quantity(item.getQuantity())
                .listPrice(listPrice)
                .unitPrice(item.getUnitPrice())
                .discountAmount(item.getDiscountAmount())
                .lineTotal(item.getLineTotal())
                .note(item.getNote())
                .build();
    }

    public static OrderItemResponse fromEntity(OrderItem item) {
        return fromEntity(item, null);
    }
}
