package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateBannerAdRequest {

    @NotBlank(message = "Tiêu đề banner không được để trống")
    private String title;

    @NotBlank(message = "URL ảnh không được để trống")
    private String imageUrl;

    private String linkUrl;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;
}
