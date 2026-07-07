package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.*;
import com.foodrescue.foodrescue_be.dto.response.*;
import com.foodrescue.foodrescue_be.config.JwtProperties;
import com.foodrescue.foodrescue_be.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @Value("${app.auth.refresh-cookie-secure:false}")
    private boolean refreshCookieSecure;        

    @Value("${app.auth.refresh-cookie-same-site:Strict}")
    private String refreshCookieSameSite;

    @PostMapping("/register")
    public ResponseEntity<ResponseData<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseData.ok("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", null));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ResponseData<String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ResponseData.ok("Xác thực email thành công. Bạn có thể đăng nhập.", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseData<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return authResponseWithRefreshCookie(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<ResponseData<AuthResponse>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return authResponseWithRefreshCookie(authService.loginWithGoogle(request.getIdToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ResponseData<AuthResponse>> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return authResponseWithRefreshCookie(authService.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseData<String>> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .body(ResponseData.ok("??ng xu?t th?nh c?ng.", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseData<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ResponseData.ok("Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseData<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ResponseData.ok("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseData<UserResponse>> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ResponseData.ok(authService.getCurrentUser(principal.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ResponseData<UserResponse>> updateMe(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ResponseData.ok(authService.updateProfile(principal.getName(), request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ResponseData<String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.changePassword(principal.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ResponseData.ok("Đổi mật khẩu thành công.", null));
    }


    private ResponseEntity<ResponseData<AuthResponse>> authResponseWithRefreshCookie(AuthResponse authResponse) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(authResponse.getRefreshToken()).toString())
                .body(ResponseData.ok(authResponse));
    }

    private ResponseCookie refreshCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ofMillis(jwtProperties.getRefreshExpirationMs()))
                .build();
    }

    private ResponseCookie expiredRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(0)
                .build();
    }

}
