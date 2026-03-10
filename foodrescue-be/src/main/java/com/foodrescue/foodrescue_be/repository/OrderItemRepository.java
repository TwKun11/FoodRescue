package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findBySellerOrderId(Long sellerOrderId);
}
