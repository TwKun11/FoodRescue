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

    @Value("${MAIL_FROM:${MAIL_USERNAME:}}")
    private String mailFrom;

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String email, String verificationToken) {
        String link = baseUrl + "?token=" + verificationToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Xac thuc email - FoodRescue");
            message.setText("Chao ban,\n\nVui long bam vao link sau de xac thuc tai khoan:\n" + link + "\n\nLink co hieu luc trong 24 gio.");
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            mailSender.send(message);
            log.info("Verification email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
            throw new RuntimeException("Khong the gui email. Vui long thu lai sau.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        String link = resetPasswordBaseUrl + "?token=" + resetToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Dat lai mat khau - FoodRescue");
            message.setText("Chao ban,\n\nBan da yeu cau dat lai mat khau. Vui long bam vao link sau de tao mat khau moi:\n" + link + "\n\nLink co hieu luc trong 1 gio. Neu khong phai ban yeu cau, hay bo qua email nay.");
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            mailSender.send(message);
            log.info("Password reset email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", email, e);
            throw new RuntimeException("Khong the gui email. Vui long thu lai sau.");
        }
    }
}
