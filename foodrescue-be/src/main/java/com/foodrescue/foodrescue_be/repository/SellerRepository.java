package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUserEmail(String email);
    Optional<Seller> findByShopSlug(String shopSlug);
    boolean existsByUserEmail(String email);
}
