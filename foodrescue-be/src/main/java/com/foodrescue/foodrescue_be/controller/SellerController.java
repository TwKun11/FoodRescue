package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.UpdateSellerRequest;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.SellerResponse;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerRepository sellerRepository;

    @GetMapping("/shop")
    public ResponseData<SellerResponse> getMyShop(Authentication auth) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        return ResponseData.ok(SellerResponse.fromEntity(seller));
    }

    @PutMapping("/shop")
    public ResponseData<SellerResponse> updateShop(
            Authentication auth,
            @RequestBody UpdateSellerRequest req
    ) {
        Seller seller = resolveByEmail((String) auth.getPrincipal());
        if (req.getShopName() != null && !req.getShopName().isBlank()) seller.setShopName(req.getShopName());
        if (req.getContactName() != null) seller.setContactName(req.getContactName());
        if (req.getPhone() != null) seller.setPhone(req.getPhone());
        if (req.getDescription() != null) seller.setDescription(req.getDescription());
        if (req.getAvatarUrl() != null) seller.setAvatarUrl(req.getAvatarUrl());
        if (req.getCoverUrl() != null) seller.setCoverUrl(req.getCoverUrl());
        return ResponseData.ok("Cập nhật cửa hàng thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    private Seller resolveByEmail(String email) {
        return sellerRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa được liên kết với cửa hàng"));
    }
}
