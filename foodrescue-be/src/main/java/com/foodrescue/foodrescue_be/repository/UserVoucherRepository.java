package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);

    Optional<UserVoucher> findByUserIdAndVoucherId(Long userId, Long voucherId);

    Optional<UserVoucher> findByUserIdAndVoucher_CodeIgnoreCaseAndStatus(Long userId, String code, UserVoucher.Status status);

    List<UserVoucher> findByUserIdOrderByClaimedAtDesc(Long userId);
}