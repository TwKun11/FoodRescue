package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String avatar;
    private LocalDate dateOfBirth;
    private String phone;
    private Role role;
    private UserStatus status;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .dateOfBirth(user.getDateOfBirth())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}