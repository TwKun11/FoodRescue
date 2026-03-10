package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.OrderSellerOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderSellerOrderRepository extends JpaRepository<OrderSellerOrder, Long> {
    Page<OrderSellerOrder> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);
    Page<OrderSellerOrder> findBySellerIdAndOrderStatusOrderByCreatedAtDesc(Long sellerId, OrderSellerOrder.SellerOrderStatus orderStatus, Pageable pageable);
}
