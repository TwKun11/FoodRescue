package com.foodrescue.foodrescue_be.dto.request;

import com.foodrescue.foodrescue_be.model.ViolationReport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateViolationReportRequest {

    @NotNull(message = "Loại báo cáo không được để trống")
    private ViolationReport.ReportType type;

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    private Long reviewId;

    @NotBlank(message = "Nội dung báo cáo không được để trống")
    private String description;

    private String evidenceUrl;
}
