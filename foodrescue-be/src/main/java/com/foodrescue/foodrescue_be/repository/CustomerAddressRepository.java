package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
}
