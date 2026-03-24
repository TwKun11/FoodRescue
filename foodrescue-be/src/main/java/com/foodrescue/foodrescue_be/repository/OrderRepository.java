package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Order> findByUserIdAndOrderStatus(Long userId, Order.OrderStatus status);

    @Query(value = "SELECT COUNT(*) FROM orders", nativeQuery = true)
    Long countAllOrdersRaw();

    @Query(value = "SELECT COUNT(*) FROM orders WHERE order_status = 'completed'", nativeQuery = true)
    Long countCompletedOrdersRaw();

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'completed'", nativeQuery = true)
    BigDecimal sumCompletedRevenueRaw();

    @Query(value = """
        SELECT MONTH(created_at) AS m, COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE order_status = 'completed' AND YEAR(created_at) = :year
        GROUP BY MONTH(created_at)
    """, nativeQuery = true)
    List<Object[]> sumCompletedRevenueByMonth(@Param("year") int year);
}
