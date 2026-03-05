package com.foodrescue.foodrescue_be.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateProfileRequest {

    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String avatar;
}
