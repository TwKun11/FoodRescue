package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.CreateBannerAdRequest;
import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;

import java.util.List;

public interface BannerAdService {

    BannerAdResponse createBannerAd(Long sellerId, CreateBannerAdRequest request);

    List<BannerAdResponse> getSellerAds(Long sellerId);

    BannerAdResponse approveAd(Long adId);

    BannerAdResponse rejectAd(Long adId, String rejectReason);

    List<BannerAdResponse> getPendingAds();

    /** Admin: lấy danh sách banner theo trạng thái (PENDING, APPROVED, REJECTED). */
    List<BannerAdResponse> getAdsByStatus(String status);

    List<BannerAdResponse> getActiveAds();
}
