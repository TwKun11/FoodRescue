package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT DISTINCT oi FROM OrderItem oi " +
           "JOIN FETCH oi.variant v " +
           "JOIN FETCH v.product " +
           "WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderIdWithVariantAndProduct(@Param("orderId") Long orderId);
    
    List<OrderItem> findBySellerOrderId(Long sellerOrderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.sellerOrder.orderStatus = 'completed' AND oi.createdAt >= :since")
    List<OrderItem> findCompletedItemsBySince(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);

    @Query("""
        SELECT oi FROM OrderItem oi
        JOIN FETCH oi.order o
        JOIN FETCH o.address a
        JOIN FETCH oi.product p
        LEFT JOIN FETCH p.category c
        WHERE oi.sellerOrder.orderStatus = 'completed'
          AND oi.createdAt >= :since
    """)
    List<OrderItem> findCompletedItemsWithDemandContextSince(@Param("since") LocalDateTime since);
}
