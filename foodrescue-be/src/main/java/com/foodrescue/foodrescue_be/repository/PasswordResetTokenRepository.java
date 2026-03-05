package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(java.time.Instant instant);
}
