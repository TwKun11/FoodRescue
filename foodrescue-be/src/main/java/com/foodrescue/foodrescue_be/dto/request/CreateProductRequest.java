package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CreateProductRequest {

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    private Long brandId;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productCode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    private String slug;

    private String shortDescription;
    private String description;

    @NotBlank(message = "Loại sản phẩm không được để trống")
    private String productType;

    @NotBlank(message = "Hình thức bán không được để trống")
    private String sellMode;

    @NotBlank(message = "Kiểu lưu trữ không được để trống")
    private String storageType;

    private String originCountry;
    private String originProvince;

    @NotNull(message = "Hạn sử dụng sản phẩm không được để trống")
    @Min(value = 1, message = "Hạn sử dụng sản phẩm phải lớn hơn 0 ngày")
    private Integer shelfLifeDays;

    @NotNull(message = "Thời hạn đăng bán không được để trống")
    @Future(message = "Thời hạn đăng bán phải sau thời điểm hiện tại")
    private LocalDateTime dealEndsAt;

    private Integer minPreparationMinutes;
    private String status;

    // Image URLs after uploading to Cloudinary
    private List<String> imageUrls;
}
