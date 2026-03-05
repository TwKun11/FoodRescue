package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.config.JwtProperties;
import com.foodrescue.foodrescue_be.dto.request.LoginRequest;
import com.foodrescue.foodrescue_be.dto.request.RegisterRequest;
import com.foodrescue.foodrescue_be.dto.request.UpdateProfileRequest;
import com.foodrescue.foodrescue_be.dto.response.AuthResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.foodrescue.foodrescue_be.dto.response.UserResponse;
import com.foodrescue.foodrescue_be.model.PasswordResetToken;
import com.foodrescue.foodrescue_be.model.PendingRegistration;
import com.foodrescue.foodrescue_be.model.RefreshToken;
import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import com.foodrescue.foodrescue_be.repository.PendingRegistrationRepository;
import com.foodrescue.foodrescue_be.repository.PasswordResetTokenRepository;
import com.foodrescue.foodrescue_be.repository.RefreshTokenRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.security.JwtUtil;
import com.foodrescue.foodrescue_be.service.AuthService;
import com.foodrescue.foodrescue_be.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final EmailService emailService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }
        pendingRegistrationRepository.findByEmail(request.getEmail()).ifPresent(pendingRegistrationRepository::delete);
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getRefreshExpirationMs());
        PendingRegistration pending = PendingRegistration.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .phone(request.getPhone())
                .verificationToken(token)
                .expiresAt(expiresAt)
                .build();
        pendingRegistrationRepository.save(pending);
        emailService.sendVerificationEmail(pending.getEmail(), token);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        PendingRegistration pending = pendingRegistrationRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link không hợp lệ hoặc đã hết hạn"));
        if (pending.getExpiresAt().isBefore(Instant.now())) {
            pendingRegistrationRepository.delete(pending);
            throw new IllegalArgumentException("Link đã hết hạn");
        }
        User user = User.builder()
                .email(pending.getEmail())
                .password(pending.getPassword())
                .fullName(pending.getFullName())
                .dateOfBirth(pending.getDateOfBirth())
                .phone(pending.getPhone())
                .status(UserStatus.ACTIVE)
                .role(Role.CUSTOMER)
                .build();
        userRepository.save(user);
        pendingRegistrationRepository.delete(pending);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không đúng"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Tài khoản chưa kích hoạt hoặc đã bị khóa");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email hoặc mật khẩu không đúng");
        }
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshTokenValue = UUID.randomUUID().toString();
        String tokenHash = sha256(refreshTokenValue);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getRefreshExpirationMs());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .build();
        refreshTokenRepository.save(refreshToken);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .expiresIn(jwtProperties.getExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalArgumentException("Google OAuth chưa được cấu hình (app.google.client-id)");
        }
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        GoogleIdToken googleIdToken;
        try {
            googleIdToken = verifier.verify(idToken);
        } catch (Exception e) {
            throw new IllegalArgumentException("Google token không hợp lệ hoặc đã hết hạn");
        }
        if (googleIdToken == null) {
            throw new IllegalArgumentException("Google token không hợp lệ");
        }
        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Không lấy được email từ Google");
        }
        String normalizedEmail = email.trim().toLowerCase();
        String fullName = payload.get("name") != null ? payload.get("name").toString() : null;
        String pictureUrl = payload.get("picture") != null ? payload.get("picture").toString() : null;

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            String encodedPassword = passwordEncoder.encode(UUID.randomUUID().toString());
            user = User.builder()
                    .email(normalizedEmail)
                    .password(encodedPassword)
                    .fullName(fullName)
                    .avatar(pictureUrl)
                    .status(UserStatus.ACTIVE)
                    .role(Role.CUSTOMER)
                    .build();
            userRepository.save(user);
        } else {
            if (user.getStatus() != UserStatus.ACTIVE) {
                throw new IllegalArgumentException("Tài khoản chưa kích hoạt hoặc đã bị khóa");
            }
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshTokenValue = UUID.randomUUID().toString();
        String tokenHash = sha256(refreshTokenValue);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getRefreshExpirationMs());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .build();
        refreshTokenRepository.save(refreshToken);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .expiresIn(jwtProperties.getExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        String tokenHash = sha256(refreshTokenValue);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token không hợp lệ"));
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token đã hết hạn");
        }
        User user = refreshToken.getUser();
        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenValue)
                .expiresIn(jwtProperties.getExpirationMs() / 1000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        String normalized = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Email chưa đăng ký tài khoản"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Tài khoản chưa kích hoạt hoặc đã bị khóa");
        }
        passwordResetTokenRepository.deleteByEmail(normalized);
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(3600);
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(normalized)
                .token(token)
                .expiresAt(expiresAt)
                .build();
        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(normalized, token);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link không hợp lệ hoặc đã hết hạn"));
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Link đã hết hạn");
        }
        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim().isEmpty() ? null : request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar().trim().isEmpty() ? null : request.getAvatar().trim());
        }
        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}