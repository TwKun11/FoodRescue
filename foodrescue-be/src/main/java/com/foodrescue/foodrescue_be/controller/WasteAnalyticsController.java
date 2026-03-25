package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.AdminWasteAnalyticsResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/waste-analytics")
@RequiredArgsConstructor
public class WasteAnalyticsController {

    private final AdminService adminService;

    @GetMapping
    public ResponseData<AdminWasteAnalyticsResponse> getWasteAnalytics(
            @RequestParam(defaultValue = "true") boolean full,
            @RequestParam(defaultValue = "5") int limit
    ) {
        AdminWasteAnalyticsResponse analytics = adminService.getWasteAnalytics(limit, full);
        return ResponseData.ok(analytics);
    }
}
