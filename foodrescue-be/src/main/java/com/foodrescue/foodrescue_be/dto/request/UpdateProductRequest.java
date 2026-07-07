package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UpdateProductRequest {

    private Long categoryId;
    private Long brandId;
    private String name;
    private String slug;
    private String shortDescription;
    private String description;
    private String productType;
    private String sellMode;
    private String storageType;
    private String originCountry;
    private String originProvince;

    @Min(value = 1, message = "Hạn sử dụng sản phẩm phải lớn hơn 0 ngày")
    private Integer shelfLifeDays;

    @Future(message = "Thời hạn đăng bán phải sau thời điểm hiện tại")
    private LocalDateTime dealEndsAt;

    private Integer minPreparationMinutes;
    private String status;
    private List<String> imageUrls;
}
