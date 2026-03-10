package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE p.status = 'active'
          AND p.isActive = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:sellerId IS NULL OR p.seller.id = :sellerId)
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Product> searchPublic(
        @Param("categoryId") Long categoryId,
        @Param("sellerId") Long sellerId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.seller.id = :sellerId
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Product> findBySeller(@Param("sellerId") Long sellerId, @Param("keyword") String keyword, Pageable pageable);
}
