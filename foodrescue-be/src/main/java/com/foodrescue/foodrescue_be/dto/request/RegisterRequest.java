package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu tối thiểu 8 ký tự")
    @Pattern(regexp = ".*[A-Z].*", message = "Mật khẩu cần ít nhất 1 chữ cái viết hoa")
    @Pattern(regexp = ".*[a-z].*", message = "Mật khẩu cần ít nhất 1 chữ cái viết thường")
    @Pattern(regexp = ".*\\d.*", message = "Mật khẩu cần ít nhất 1 chữ số")
    @Pattern(regexp = ".*[^A-Za-z0-9].*", message = "Mật khẩu cần ít nhất 1 ký tự đặc biệt")
    private String password;

    private String fullName;

    private LocalDate dateOfBirth;

    private String phone;
}
