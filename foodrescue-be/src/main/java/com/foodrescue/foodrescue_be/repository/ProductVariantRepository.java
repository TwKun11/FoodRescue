package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdAndStatusOrderBySalePrice(Long productId, ProductVariant.VariantStatus status);
    List<ProductVariant> findByProductIdOrderByIsDefaultDescSalePriceAsc(Long productId);
}
