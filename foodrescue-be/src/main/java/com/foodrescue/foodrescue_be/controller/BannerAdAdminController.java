package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.BannerAdService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API cho Admin: duyệt / từ chối banner.
 * Base path: /api/admin/ads
 */
@RestController
@RequestMapping("/api/admin/ads")
@RequiredArgsConstructor
public class BannerAdAdminController {

    private final BannerAdService bannerAdService;

    @GetMapping("/pending")
    public ResponseData<List<BannerAdResponse>> pending() {
        return ResponseData.ok(bannerAdService.getPendingAds());
    }

    /** Lấy danh sách banner theo trạng thái: ?status=pending | approved | rejected */
    @GetMapping
    public ResponseData<List<BannerAdResponse>> listByStatus(@RequestParam(required = false, defaultValue = "pending") String status) {
        return ResponseData.ok(bannerAdService.getAdsByStatus(status));
    }

    @PutMapping("/{id}/approve")
    public ResponseData<BannerAdResponse> approve(@PathVariable Long id) {
        return ResponseData.ok("Đã duyệt banner", bannerAdService.approveAd(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseData<BannerAdResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("rejectReason") : null;
        return ResponseData.ok("Đã từ chối banner", bannerAdService.rejectAd(id, reason));
    }
}
