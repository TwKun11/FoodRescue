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

    @NotBlank(message = "Phuong thuc thanh toan khong duoc de trong")
    private String paymentMethod;

    @Size(max = 500, message = "Ghi chu khong duoc vuot qua 500 ky tu")
    private String note;

    @NotNull(message = "Gio hang khong duoc de trong")
    @Size(min = 1, max = 100, message = "Gio hang phai co tu 1 den 100 dong san pham")
    @Valid
    private List<OrderLineRequest> items;

    @Getter
    @Setter
    public static class OrderLineRequest {
        @NotNull(message = "variantId khong duoc de trong")
        private Long variantId;

        @NotNull(message = "So luong khong duoc de trong")
        @Positive(message = "So luong phai lon hon 0")
        private BigDecimal quantity;

        @Size(max = 255, message = "Ghi chu dong san pham khong duoc vuot qua 255 ky tu")
        private String note;
    }
}
