package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.CreateBannerAdRequest;
import com.foodrescue.foodrescue_be.dto.response.BannerAdResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.service.BannerAdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API cho Seller: tạo và xem danh sách banner quảng cáo của mình.
 * Base path: /api/seller/ads
 */
@RestController
@RequestMapping("/api/seller/ads")
@RequiredArgsConstructor
public class BannerAdSellerController {

    private final BannerAdService bannerAdService;
    private final SellerRepository sellerRepository;

    @PostMapping("/create")
    public ResponseData<BannerAdResponse> create(
            Authentication auth,
            @RequestBody @Valid CreateBannerAdRequest request
    ) {
        Long sellerId = resolveSellerId(auth);
        return ResponseData.ok("Tạo banner thành công", bannerAdService.createBannerAd(sellerId, request));
    }

    @GetMapping("/my-ads")
    public ResponseData<List<BannerAdResponse>> myAds(Authentication auth) {
        Long sellerId = resolveSellerId(auth);
        return ResponseData.ok(bannerAdService.getSellerAds(sellerId));
    }

    private Long resolveSellerId(Authentication auth) {
        String email = (String) auth.getPrincipal();
        Seller seller = sellerRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa được liên kết với cửa hàng"));
        return seller.getId();
    }
}
