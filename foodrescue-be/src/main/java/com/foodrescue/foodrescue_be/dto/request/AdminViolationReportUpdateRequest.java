package com.foodrescue.foodrescue_be.dto.request;

import com.foodrescue.foodrescue_be.model.ViolationReport;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminViolationReportUpdateRequest {

    @NotNull(message = "Trạng thái xử lý không được để trống")
    private ViolationReport.Status status;

    private String adminNote;
}
