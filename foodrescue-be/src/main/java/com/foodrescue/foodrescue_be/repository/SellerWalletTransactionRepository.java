package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.SellerWalletTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface SellerWalletTransactionRepository extends JpaRepository<SellerWalletTransaction, Long> {
    boolean existsBySellerOrderIdAndType(Long sellerOrderId, SellerWalletTransaction.TransactionType type);

    List<SellerWalletTransaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM SellerWalletTransaction t WHERE t.seller.id = :sellerId AND t.status = :status")
    BigDecimal sumAmountBySellerAndStatus(
            @Param("sellerId") Long sellerId,
            @Param("status") SellerWalletTransaction.TransactionStatus status
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM SellerWalletTransaction t WHERE t.seller.id = :sellerId AND t.type = :type")
    BigDecimal sumAmountBySellerAndType(
            @Param("sellerId") Long sellerId,
            @Param("type") SellerWalletTransaction.TransactionType type
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM SellerWalletTransaction t WHERE t.seller.id = :sellerId AND t.type = :type AND t.status IN :statuses")
    BigDecimal sumAmountBySellerTypeAndStatuses(
            @Param("sellerId") Long sellerId,
            @Param("type") SellerWalletTransaction.TransactionType type,
            @Param("statuses") Collection<SellerWalletTransaction.TransactionStatus> statuses
    );
}
