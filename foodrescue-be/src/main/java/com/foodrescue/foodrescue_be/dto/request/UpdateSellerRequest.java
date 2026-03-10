package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSellerRequest {
    private String shopName;
    private String contactName;
    private String phone;
    private String description;
    private String avatarUrl;
    private String coverUrl;
}
