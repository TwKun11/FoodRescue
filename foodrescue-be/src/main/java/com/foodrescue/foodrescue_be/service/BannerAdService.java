package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.CreateBannerAdRequest;
import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;

import java.util.List;

public interface BannerAdService {

    BannerAdResponse createBannerAd(Long sellerId, CreateBannerAdRequest request);

    List<BannerAdResponse> getSellerAds(Long sellerId);

    BannerAdResponse approveAd(Long adId);

    BannerAdResponse rejectAd(Long adId, String rejectReason);

    BannerAdResponse takeDownAd(Long adId, String reason);

    List<BannerAdResponse> getPendingAds();

    /** Admin: lấy danh sách banner theo trạng thái (PENDING, APPROVED, REJECTED, TAKEN_DOWN). */
    List<BannerAdResponse> getAdsByStatus(String status);

    List<BannerAdResponse> getActiveAds();
}
