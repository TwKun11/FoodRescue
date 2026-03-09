package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PlaceOrderRequest {

    private Long addressId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    private String note;

    @NotNull(message = "Giỏ hàng không được để trống")
    private List<OrderLineRequest> items;

    @Getter
    @Setter
    public static class OrderLineRequest {
        @NotNull
        private Long variantId;

        @NotNull
        private BigDecimal quantity;

        private String note;
    }
}
