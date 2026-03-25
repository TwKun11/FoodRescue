package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.AdminReviewModerationRequest;
import com.foodrescue.foodrescue_be.dto.response.AdminReviewResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.model.Review;
import com.foodrescue.foodrescue_be.repository.ReviewRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseData<Page<AdminReviewResponse>> listReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) Boolean spamOnly,
            @RequestParam(required = false) Boolean flaggedOnly
    ) {
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<AdminReviewResponse> result = reviewRepository.findAllForAdmin(
                        searchTrimmed,
                        minRating,
                        maxRating,
                        spamOnly,
                        flaggedOnly,
                        PageRequest.of(page, size, Sort.by("createdAt").descending())
                )
                .map(review -> AdminReviewResponse.fromEntity(review, isUnusualNegative(review)));

        return ResponseData.ok(result);
    }

    @PutMapping("/{id}/mark-spam")
    public ResponseData<AdminReviewResponse> markSpam(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) AdminReviewModerationRequest request
    ) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại"));

        review.setIsSpam(true);
        if (request != null) {
            review.setModerationNote(cleanNullable(request.getNote()));
        }
        review.setModeratedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        return ResponseData.ok("Đã đánh dấu spam", AdminReviewResponse.fromEntity(saved, isUnusualNegative(saved)));
    }

    @PutMapping("/{id}/flag-negative")
    public ResponseData<AdminReviewResponse> flagNegative(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) AdminReviewModerationRequest request
    ) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại"));

        if (review.getRating() == null || review.getRating() > 2) {
            throw new IllegalArgumentException("Chỉ có thể gắn cờ đánh giá tiêu cực với rating <= 2");
        }

        review.setIsNegativeFlagged(true);
        if (request != null) {
            review.setModerationNote(cleanNullable(request.getNote()));
        }
        review.setModeratedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        return ResponseData.ok("Đã gắn cờ tiêu cực", AdminReviewResponse.fromEntity(saved, isUnusualNegative(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Đánh giá không tồn tại"));
        reviewRepository.delete(review);
        return ResponseData.ok("Đã xóa review", null);
    }

    private boolean isUnusualNegative(Review review) {
        if (review.getProduct() == null || review.getProduct().getId() == null) return false;
        if (review.getRating() == null || review.getRating() > 2) return false;

        long negativeCountLast30Days = reviewRepository.countNegativeReviewsByProductSince(
                review.getProduct().getId(),
                LocalDateTime.now().minusDays(30)
        );

        return negativeCountLast30Days >= 5;
    }

    private String cleanNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
