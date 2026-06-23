package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;

public interface EmailService {

    void sendVerificationEmail(String email, String verificationToken);

    void sendPasswordResetEmail(String email, String resetToken);

    void sendSellerApplicationApprovedEmail(User user, Seller seller);
}