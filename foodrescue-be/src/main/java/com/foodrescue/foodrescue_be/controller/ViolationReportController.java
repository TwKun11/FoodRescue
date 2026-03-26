package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.AdminViolationReportUpdateRequest;
import com.foodrescue.foodrescue_be.dto.request.CreateViolationReportRequest;
import com.foodrescue.foodrescue_be.dto.response.AdminModerationStatsResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.ViolationReportResponse;
import com.foodrescue.foodrescue_be.model.Product;
import com.foodrescue.foodrescue_be.model.Review;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.ViolationReport;
import com.foodrescue.foodrescue_be.repository.ProductRepository;
import com.foodrescue.foodrescue_be.repository.ReviewRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.repository.ViolationReportRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class ViolationReportController {

    private final ViolationReportRepository violationReportRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    @PostMapping("/api/reports")
    @Transactional
    public ResponseData<ViolationReportResponse> createReport(
            Authentication auth,
            @Valid @RequestBody CreateViolationReportRequest request
    ) {
        User reporter = resolveUser(auth);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        Review review = null;
        if (request.getReviewId() != null) {
            review = reviewRepository.findById(request.getReviewId())
                    .orElseThrow(() -> new IllegalArgumentException("Review không tồn tại"));
        }

        ViolationReport report = ViolationReport.builder()
                .reporter(reporter)
                .product(product)
                .review(review)
                .type(request.getType())
                .status(ViolationReport.Status.PENDING)
                .description(clean(request.getDescription()))
                .evidenceUrl(cleanNullable(request.getEvidenceUrl()))
                .build();

        ViolationReport saved = violationReportRepository.save(report);
        return ResponseData.ok("Gửi báo cáo thành công", ViolationReportResponse.fromEntity(saved));
    }

    @GetMapping("/api/reports/me")
    public ResponseData<Page<ViolationReportResponse>> myReports(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        User reporter = resolveUser(auth);
        Page<ViolationReportResponse> result = violationReportRepository
                .findByReporterIdOrderByCreatedAtDesc(
                        reporter.getId(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending())
                )
                .map(ViolationReportResponse::fromEntity);

        return ResponseData.ok(result);
    }

    @GetMapping("/api/admin/reports")
    public ResponseData<Page<ViolationReportResponse>> adminReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ViolationReport.ReportType type,
            @RequestParam(required = false) ViolationReport.Status status
    ) {
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<ViolationReportResponse> result = violationReportRepository
                .findAllForAdmin(
                        searchTrimmed,
                        type,
                        status,
                        PageRequest.of(page, size, Sort.by("createdAt").descending())
                )
                .map(ViolationReportResponse::fromEntity);

        return ResponseData.ok(result);
    }

    @GetMapping("/api/admin/reports/stats")
    public ResponseData<AdminModerationStatsResponse> moderationStats(
            @RequestParam(defaultValue = "5") int topSellerLimit
    ) {
        long totalReports = violationReportRepository.count();
        long pendingReports = violationReportRepository.countByStatus(ViolationReport.Status.PENDING);
        long inReviewReports = violationReportRepository.countByStatus(ViolationReport.Status.IN_REVIEW);
        long resolvedReports = violationReportRepository.countByStatus(ViolationReport.Status.RESOLVED);
        long rejectedReports = violationReportRepository.countByStatus(ViolationReport.Status.REJECTED);
        long spoiledFoodReports = violationReportRepository.countByType(ViolationReport.ReportType.SPOILED_FOOD);
        long misdescriptionReports = violationReportRepository.countByType(ViolationReport.ReportType.MISDESCRIPTION);

        long totalReviews = reviewRepository.count();
        long spamReviews = reviewRepository.countByIsSpamTrue();
        long flaggedNegativeReviews = reviewRepository.countByIsNegativeFlaggedTrue();
        double spamRate = totalReviews > 0 ? (double) spamReviews * 100.0 / totalReviews : 0.0;
        Double avgResolutionHours = violationReportRepository.getAverageResolutionHours();

        int limit = Math.max(1, Math.min(topSellerLimit, 20));
        List<AdminModerationStatsResponse.TopSellerIssue> topSellerIssues = violationReportRepository
                .getTopSellerIssues(limit)
                .stream()
                .map(row -> AdminModerationStatsResponse.TopSellerIssue.builder()
                        .sellerId(row[0] != null ? ((Number) row[0]).longValue() : null)
                        .sellerName(row[1] != null ? String.valueOf(row[1]) : "-")
                        .totalReports(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                        .openReports(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                        .resolvedReports(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                        .build())
                .toList();

        AdminModerationStatsResponse data = AdminModerationStatsResponse.builder()
                .totalReports(totalReports)
                .pendingReports(pendingReports)
                .inReviewReports(inReviewReports)
                .resolvedReports(resolvedReports)
                .rejectedReports(rejectedReports)
                .spoiledFoodReports(spoiledFoodReports)
                .misdescriptionReports(misdescriptionReports)
                .totalReviews(totalReviews)
                .spamReviews(spamReviews)
                .flaggedNegativeReviews(flaggedNegativeReviews)
                .spamRate(Math.round(spamRate * 100.0) / 100.0)
                .avgResolutionHours(avgResolutionHours == null ? 0.0 : Math.round(avgResolutionHours * 100.0) / 100.0)
                .topSellersByReports(topSellerIssues)
                .build();

        return ResponseData.ok(data);
    }

    @PutMapping("/api/admin/reports/{id}/status")
    @Transactional
    public ResponseData<ViolationReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminViolationReportUpdateRequest request
    ) {
        ViolationReport report = violationReportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Báo cáo không tồn tại"));

        report.setStatus(request.getStatus());
        report.setAdminNote(cleanNullable(request.getAdminNote()));
        if (request.getStatus() == ViolationReport.Status.RESOLVED || request.getStatus() == ViolationReport.Status.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        } else {
            report.setResolvedAt(null);
        }

        ViolationReport saved = violationReportRepository.save(report);
        return ResponseData.ok("Cập nhật trạng thái báo cáo thành công", ViolationReportResponse.fromEntity(saved));
    }

    private User resolveUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Chưa đăng nhập");
        }
        String email = String.valueOf(auth.getPrincipal());
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private String cleanNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
