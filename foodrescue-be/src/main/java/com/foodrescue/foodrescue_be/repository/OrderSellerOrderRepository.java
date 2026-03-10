package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.OrderSellerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderSellerOrderRepository extends JpaRepository<OrderSellerOrder, Long> {
    Page<OrderSellerOrder> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);
    Page<OrderSellerOrder> findBySellerIdAndOrderStatusOrderByCreatedAtDesc(Long sellerId, OrderSellerOrder.SellerOrderStatus orderStatus, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderSellerOrder o WHERE o.seller.id = :sellerId AND o.orderStatus = 'completed'")
    BigDecimal sumTotalRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) FROM OrderSellerOrder o WHERE o.seller.id = :sellerId")
    Long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) FROM OrderSellerOrder o WHERE o.seller.id = :sellerId AND o.orderStatus = 'completed'")
    Long countCompletedBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT o FROM OrderSellerOrder o WHERE o.seller.id = :sellerId AND o.orderStatus = 'completed' AND o.createdAt >= :since ORDER BY o.createdAt ASC")
    List<OrderSellerOrder> findCompletedSince(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);
}
