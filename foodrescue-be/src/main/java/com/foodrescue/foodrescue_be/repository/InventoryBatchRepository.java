package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}
