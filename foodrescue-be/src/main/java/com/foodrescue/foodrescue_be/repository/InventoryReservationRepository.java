package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    @Query("""
        SELECT r FROM InventoryReservation r
        WHERE r.orderItem.order.id = :orderId
        ORDER BY r.id ASC
    """)
    List<InventoryReservation> findByOrderId(@Param("orderId") Long orderId);

    @Query("""
        SELECT r FROM InventoryReservation r
        WHERE r.orderItem.order.id = :orderId AND r.status = :status
        ORDER BY r.id ASC
    """)
    List<InventoryReservation> findByOrderIdAndStatus(
            @Param("orderId") Long orderId,
            @Param("status") InventoryReservation.ReservationStatus status
    );

    @Query("""
        SELECT r FROM InventoryReservation r
        WHERE r.orderItem.sellerOrder.id = :sellerOrderId AND r.status = :status
        ORDER BY r.id ASC
    """)
    List<InventoryReservation> findBySellerOrderIdAndStatus(
            @Param("sellerOrderId") Long sellerOrderId,
            @Param("status") InventoryReservation.ReservationStatus status
    );
}
