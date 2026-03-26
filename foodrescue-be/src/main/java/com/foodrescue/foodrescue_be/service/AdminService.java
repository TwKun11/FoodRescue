package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.response.AdminWasteAnalyticsResponse;
import com.foodrescue.foodrescue_be.dto.response.AdminStatsResponse;

public interface AdminService {
    AdminWasteAnalyticsResponse getWasteAnalytics();
    AdminWasteAnalyticsResponse getWasteAnalytics(Integer actionItemsLimit, boolean full);
    AdminStatsResponse getAdminStats();
}
