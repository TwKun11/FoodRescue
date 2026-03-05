package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByVerificationToken(String verificationToken);

    Optional<PendingRegistration> findByEmail(String email);

    void deleteByExpiresAtBefore(Instant instant);
}