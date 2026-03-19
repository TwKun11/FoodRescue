package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewSellerApplicationRequest {

    @Size(max = 2000, message = "Ghi chú không được vượt quá 2000 ký tự")
    private String adminNote;
}
