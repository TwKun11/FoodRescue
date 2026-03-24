package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.OrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {
    Optional<OrderPayment> findByOrderId(Long orderId);
    Optional<OrderPayment> findByProviderOrderCode(Long providerOrderCode);
    List<OrderPayment> findByProviderAndStatusOrderByCreatedAtAsc(
            OrderPayment.PaymentProvider provider,
            OrderPayment.PaymentTransactionStatus status
    );

    @Query("""
        SELECT p FROM OrderPayment p
        WHERE p.status = :status
          AND p.expiresAt IS NOT NULL
          AND p.expiresAt <= :deadline
        ORDER BY p.expiresAt ASC, p.id ASC
    """)
    List<OrderPayment> findByStatusAndExpiresAtBeforeOrEqual(
            @Param("status") OrderPayment.PaymentTransactionStatus status,
            @Param("deadline") LocalDateTime deadline
    );

    @Query("""
        SELECT p FROM OrderPayment p
        WHERE p.status = :status
          AND p.expiresAt IS NULL
          AND p.createdAt <= :deadline
        ORDER BY p.createdAt ASC, p.id ASC
    """)
    List<OrderPayment> findByStatusAndMissingExpiresAtCreatedBeforeOrEqual(
            @Param("status") OrderPayment.PaymentTransactionStatus status,
            @Param("deadline") LocalDateTime deadline
    );
}
