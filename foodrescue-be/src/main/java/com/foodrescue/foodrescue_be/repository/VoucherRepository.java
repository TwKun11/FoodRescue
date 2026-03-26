package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

        Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    @Query("""
            select v from Voucher v
            where (:search is null
                    or lower(v.code) like lower(concat('%', :search, '%'))
                    or lower(v.name) like lower(concat('%', :search, '%')))
              and (:status is null or v.status = :status)
              and (:discountType is null or v.discountType = :discountType)
            """)
    Page<Voucher> findAllFiltered(
            @Param("search") String search,
            @Param("status") Voucher.Status status,
            @Param("discountType") Voucher.DiscountType discountType,
            Pageable pageable
    );
}
