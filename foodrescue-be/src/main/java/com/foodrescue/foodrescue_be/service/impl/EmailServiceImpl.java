package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Value("${app.verification.base-url:http://localhost:3000/verify-email}")
    private String baseUrl;

    @Value("${app.reset-password.base-url:http://localhost:3000/reset-password}")
    private String resetPasswordBaseUrl;

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String email, String verificationToken) {
        String link = baseUrl + "?token=" + verificationToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Xác thực email - FoodRescue");
            message.setText("Chào bạn,\n\nVui lòng bấm vào link sau để xác thực tài khoản:\n" + link + "\n\nLink có hiệu lực trong 24 giờ.");
            message.setFrom("nhybui2312@gmail.com");
            mailSender.send(message);
            log.info("Verification email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        String link = resetPasswordBaseUrl + "?token=" + resetToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Đặt lại mật khẩu - FoodRescue");
            message.setText("Chào bạn,\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng bấm vào link sau để tạo mật khẩu mới:\n" + link + "\n\nLink có hiệu lực trong 1 giờ. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.");
            message.setFrom("nhybui2312@gmail.com");
            mailSender.send(message);
            log.info("Password reset email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", email, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
}