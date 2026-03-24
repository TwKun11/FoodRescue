package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {

    List<ReviewImage> findByReviewIdOrderByDisplayOrder(Long reviewId);

    void deleteByReviewId(Long reviewId);
}
