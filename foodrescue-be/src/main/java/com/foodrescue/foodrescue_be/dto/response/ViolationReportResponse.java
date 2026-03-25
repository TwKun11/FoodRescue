package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.ViolationReport;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ViolationReportResponse {
    private Long id;
    private String type;
    private String status;
    private Long reporterId;
    private String reporterEmail;
    private String reporterName;
    private Long productId;
    private String productName;
    private Long reviewId;
    private String description;
    private String evidenceUrl;
    private String adminNote;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ViolationReportResponse fromEntity(ViolationReport report) {
        return ViolationReportResponse.builder()
                .id(report.getId())
                .type(report.getType() != null ? report.getType().name() : null)
                .status(report.getStatus() != null ? report.getStatus().name() : null)
                .reporterId(report.getReporter() != null ? report.getReporter().getId() : null)
                .reporterEmail(report.getReporter() != null ? report.getReporter().getEmail() : null)
                .reporterName(report.getReporter() != null ? report.getReporter().getFullName() : null)
                .productId(report.getProduct() != null ? report.getProduct().getId() : null)
                .productName(report.getProduct() != null ? report.getProduct().getName() : null)
                .reviewId(report.getReview() != null ? report.getReview().getId() : null)
                .description(report.getDescription())
                .evidenceUrl(report.getEvidenceUrl())
                .adminNote(report.getAdminNote())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
