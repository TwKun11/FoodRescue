package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Tìm review của user cho product cụ thể (eager load user)
     */
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    /**
     * Tìm review của user cho product với eager loading user
     */
    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.product.id = :productId AND r.user.id = :userId")
    Optional<Review> findByProductIdAndUserIdWithUser(@Param("productId") Long productId, @Param("userId") Long userId);

    /**
     * Lấy tất cả reviews của product, phân trang
     */
    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    /**
     * Lấy tất cả reviews của product với eager loading user
     */
    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    Page<Review> findByProductIdWithUser(@Param("productId") Long productId, Pageable pageable);

    /**
     * Tính trung bình rating của product
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * Đếm review theo rating level
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId GROUP BY r.rating")
    java.util.List<Object[]> countReviewsByRatingForProduct(@Param("productId") Long productId);

    /**
     * Đếm tổng reviews của product
     */
    long countByProductId(Long productId);

    /**
     * Check xem user đã review product này chưa
     */
    boolean existsByProductIdAndUserId(Long productId, Long userId);

    /**
     * Tính trung bình rating của multiple products
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id IN :productIds")
    Double getAverageRatingByProductIds(@Param("productIds") java.util.List<Long> productIds);

    /**
     * Đếm tổng reviews của multiple products
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id IN :productIds")
    long countByProductIds(@Param("productIds") java.util.List<Long> productIds);

    /**
     * Đếm review theo rating level cho multiple products
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id IN :productIds GROUP BY r.rating")
    java.util.List<Object[]> countReviewsByRatingForProducts(@Param("productIds") java.util.List<Long> productIds);

    /**
     * Lấy top N sản phẩm được đánh giá cao nhất
     */
    @Query(value = "SELECT p.id as id, p.name as name, " +
                   "COALESCE(MAX(pi.image_url), '') as primaryImageUrl, " +
                   "ROUND(COALESCE(AVG(r.rating), 0), 1) as avgRating, " +
                   "COALESCE(COUNT(DISTINCT r.id), 0) as reviewCount " +
                   "FROM products p " +
                   "LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1 " +
                   "LEFT JOIN reviews r ON p.id = r.product_id " +
                   "WHERE p.id IN (:productIds) " +
                   "GROUP BY p.id, p.name " +
                   "ORDER BY COALESCE(AVG(r.rating), 0) DESC, COALESCE(COUNT(DISTINCT r.id), 0) DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<Map<String, Object>> getTopRatedProducts(@Param("productIds") List<Long> productIds, @Param("limit") int limit);
}
