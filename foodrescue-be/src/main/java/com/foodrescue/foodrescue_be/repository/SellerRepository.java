package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Seller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<Seller> findByUserEmail(String email);

    Optional<Seller> findByShopSlug(String shopSlug);
    boolean existsByUserEmail(String email);
    boolean existsByUserId(Long userId);

    @EntityGraph(attributePaths = "user")
    @Query("SELECT s FROM Seller s JOIN s.user u WHERE " +
            "(:search IS NULL OR :search = '' OR LOWER(s.shopName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.contactName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<Seller> findAllWithFilter(@Param("search") String search, @Param("status") Seller.Status status, Pageable pageable);
}
