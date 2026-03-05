package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.*;
import com.foodrescue.foodrescue_be.dto.response.AuthResponse;
import com.foodrescue.foodrescue_be.dto.response.UserResponse;

public interface AuthService {

    void register(RegisterRequest request);

    void verifyEmail(String token);

    AuthResponse login(LoginRequest request);

    AuthResponse loginWithGoogle(String idToken);

    AuthResponse refreshToken(String refreshToken);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    UserResponse getCurrentUser(String email);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, String currentPassword, String newPassword);
}