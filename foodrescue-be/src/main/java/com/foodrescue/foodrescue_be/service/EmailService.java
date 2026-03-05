package com.foodrescue.foodrescue_be.service;

public interface EmailService {

    void sendVerificationEmail(String email, String verificationToken);

    void sendPasswordResetEmail(String email, String resetToken);
}