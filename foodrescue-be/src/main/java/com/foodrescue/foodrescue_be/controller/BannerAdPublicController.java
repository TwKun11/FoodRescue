package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.BannerAdService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API public: lấy banner đang hoạt động để hiển thị trên trang products.
 * Base path: /api/public/ads
 */
@RestController
@RequestMapping("/api/public/ads")
@RequiredArgsConstructor
public class BannerAdPublicController {

    private final BannerAdService bannerAdService;

    @GetMapping("/active-banners")
    public ResponseData<List<BannerAdResponse>> activeBanners() {
        return ResponseData.ok(bannerAdService.getActiveAds());
    }
}
