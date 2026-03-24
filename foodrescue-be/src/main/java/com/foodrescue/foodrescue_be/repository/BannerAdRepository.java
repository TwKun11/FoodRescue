package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.BannerAd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerAdRepository extends JpaRepository<BannerAd, Long> {

    List<BannerAd> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<BannerAd> findByStatusOrderByCreatedAtDesc(BannerAd.Status status);

    /** Chỉ lấy banner APPROVED và chưa hết hạn (endDate >= now). Duyệt xong là hiển thị ngay, không cần đợi startDate. */
    @Query("SELECT b FROM BannerAd b WHERE b.status = 'APPROVED' AND b.endDate >= :now ORDER BY b.createdAt DESC")
    List<BannerAd> findActiveBanners(@Param("now") LocalDateTime now);
}
