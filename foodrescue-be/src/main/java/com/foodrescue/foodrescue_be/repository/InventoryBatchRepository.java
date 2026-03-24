package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    @Query("""
        SELECT SUM(b.quantityAvailable) FROM InventoryBatch b
        WHERE b.variant.id = :variantId AND b.status = 'active'
    """)
    BigDecimal sumAvailableByVariantId(@Param("variantId") Long variantId);

    List<InventoryBatch> findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(
        Long variantId, InventoryBatch.BatchStatus status
    );

    List<InventoryBatch> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

        @Query("""
                SELECT b FROM InventoryBatch b
                JOIN FETCH b.variant v
                JOIN FETCH v.product p
                LEFT JOIN FETCH p.category c
                LEFT JOIN FETCH b.seller s
                WHERE b.expiredAt IS NOT NULL
                    AND b.expiredAt <= :now
                    AND b.quantityAvailable > 0
        """)
        List<InventoryBatch> findExpiredBatchesWithRemainingQty(@Param("now") LocalDateTime now);

        @Query("""
                SELECT b FROM InventoryBatch b
                JOIN FETCH b.variant v
                JOIN FETCH v.product p
                LEFT JOIN FETCH p.category c
                LEFT JOIN FETCH b.seller s
                WHERE b.expiredAt IS NOT NULL
                    AND b.expiredAt <= :horizon
                    AND b.quantityAvailable > 0
                    AND b.status IN ('active', 'expired')
                ORDER BY b.expiredAt ASC
        """)
        List<InventoryBatch> findActionableBatchesUntil(@Param("horizon") LocalDateTime horizon);
}
