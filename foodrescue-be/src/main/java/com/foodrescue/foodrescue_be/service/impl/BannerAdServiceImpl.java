package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.CreateBannerAdRequest;
import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;
import com.foodrescue.foodrescue_be.model.BannerAd;
import com.foodrescue.foodrescue_be.repository.BannerAdRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.service.BannerAdService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerAdServiceImpl implements BannerAdService {

    private final BannerAdRepository bannerAdRepository;
    private final SellerRepository sellerRepository;

    @Override
    @Transactional
    public BannerAdResponse createBannerAd(Long sellerId, CreateBannerAdRequest request) {
        sellerRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller không tồn tại"));

        LocalDateTime now = LocalDateTime.now();
        if (request.getStartDate().isBefore(now)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được trong quá khứ");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        BannerAd ad = BannerAd.builder()
                .sellerId(sellerId)
                .title(request.getTitle().trim())
                .imageUrl(request.getImageUrl().trim())
                .linkUrl(request.getLinkUrl() != null ? request.getLinkUrl().trim() : null)
                .status(BannerAd.Status.PENDING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        ad = bannerAdRepository.save(ad);
        return BannerAdResponse.fromEntity(ad);
    }

    @Override
    public List<BannerAdResponse> getSellerAds(Long sellerId) {
        return bannerAdRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(BannerAdResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BannerAdResponse approveAd(Long adId) {
        BannerAd ad = bannerAdRepository.findById(adId)
                .orElseThrow(() -> new IllegalArgumentException("Banner không tồn tại"));
        if (ad.getStatus() != BannerAd.Status.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể duyệt banner đang chờ duyệt");
        }
        ad.setStatus(BannerAd.Status.APPROVED);
        ad.setRejectReason(null);
        ad = bannerAdRepository.save(ad);
        return BannerAdResponse.fromEntity(ad);
    }

    @Override
    @Transactional
    public BannerAdResponse rejectAd(Long adId, String rejectReason) {
        BannerAd ad = bannerAdRepository.findById(adId)
                .orElseThrow(() -> new IllegalArgumentException("Banner không tồn tại"));
        if (ad.getStatus() != BannerAd.Status.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể từ chối banner đang chờ duyệt");
        }
        ad.setStatus(BannerAd.Status.REJECTED);
        ad.setRejectReason(rejectReason != null ? rejectReason.trim() : null);
        ad = bannerAdRepository.save(ad);
        return BannerAdResponse.fromEntity(ad);
    }

    @Override
    public List<BannerAdResponse> getPendingAds() {
        return bannerAdRepository.findByStatusOrderByCreatedAtDesc(BannerAd.Status.PENDING).stream()
                .map(BannerAdResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<BannerAdResponse> getAdsByStatus(String status) {
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
        BannerAd.Status enumStatus;
        try {
            enumStatus = BannerAd.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            enumStatus = BannerAd.Status.PENDING;
        }
        return bannerAdRepository.findByStatusOrderByCreatedAtDesc(enumStatus).stream()
                .map(BannerAdResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<BannerAdResponse> getActiveAds() {
        LocalDateTime now = LocalDateTime.now();
        return bannerAdRepository.findActiveBanners(now).stream()
                .map(BannerAdResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
