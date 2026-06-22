package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;

    @Size(max = 50, message = "Mã voucher không được vượt quá 50 ký tự")
    private String voucherCode;

    @NotNull(message = "Giỏ hàng không được để trống")
    @Size(min = 1, max = 100, message = "Giỏ hàng phải có từ 1 đến 100 dòng sản phẩm")
    @Valid
    private List<OrderLineRequest> items;

    @Getter
    @Setter
    public static class OrderLineRequest {
        @NotNull(message = "variantId không được để trống")
        private Long variantId;

        @NotNull(message = "Số lượng không được để trống")
        @Positive(message = "Số lượng phải lớn hơn 0")
        private BigDecimal quantity;

        @Size(max = 255, message = "Ghi chú dòng sản phẩm không được vượt quá 255 ký tự")
        private String note;
    }
}
