package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.ReviewSellerApplicationRequest;
import com.foodrescue.foodrescue_be.dto.request.SubmitSellerApplicationRequest;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.SellerResponse;
import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@RestController
@RequiredArgsConstructor
public class SellerApplicationController {

    private static final String TERMS_VERSION = "seller-terms-v1";

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/api/seller-applications/me")
    public ResponseData<SellerResponse> getMyApplication(Authentication auth) {
        User user = resolveUser(auth);
        return ResponseData.ok(
                sellerRepository.findByUserId(user.getId())
                        .map(SellerResponse::fromEntity)
                        .orElse(null)
        );
    }

    @PostMapping("/api/seller-applications/me")
    @Transactional
    public ResponseData<SellerResponse> submitMyApplication(
            Authentication auth,
            @Valid @RequestBody SubmitSellerApplicationRequest request
    ) {
        User user = resolveUser(auth);
        ensureEligibleApplicant(user);

        String normalizedSlug = normalizeSlug(request.getShopSlug());
        validateShopSlug(normalizedSlug, user.getId());

        Seller seller = sellerRepository.findByUserId(user.getId()).orElseGet(Seller::new);
        if (seller.getId() != null && seller.getStatus() == Seller.Status.active && Boolean.TRUE.equals(seller.getIsVerified())) {
            throw new IllegalArgumentException("Tài khoản đã là nhà bán hàng");
        }

        seller.setUser(user);
        if (seller.getCode() == null || seller.getCode().isBlank()) {
            seller.setCode(generateSellerCode(user.getId()));
        }
        if (seller.getCommissionRate() == null) {
            seller.setCommissionRate(BigDecimal.ZERO);
        }
        if (seller.getRatingAvg() == null) {
            seller.setRatingAvg(BigDecimal.ZERO);
        }
        seller.setShopName(clean(request.getShopName()));
        seller.setShopSlug(normalizedSlug);
        seller.setLegalName(cleanNullable(request.getLegalName()));
        seller.setBusinessType(cleanNullable(request.getBusinessType()));
        seller.setContactName(clean(request.getContactName()));
        seller.setPhone(cleanNullable(request.getPhone()));
        seller.setPickupAddress(cleanNullable(request.getPickupAddress()));
        seller.setTaxCode(cleanNullable(request.getTaxCode()));
        seller.setBusinessLicenseNumber(cleanNullable(request.getBusinessLicenseNumber()));
        seller.setIdentityNumber(cleanNullable(request.getIdentityNumber()));
        seller.setDescription(cleanNullable(request.getDescription()));
        seller.setStorefrontImageUrl(cleanNullable(request.getStorefrontImageUrl()));
        seller.setBusinessLicenseImageUrl(cleanNullable(request.getBusinessLicenseImageUrl()));
        seller.setIdentityCardImageUrl(cleanNullable(request.getIdentityCardImageUrl()));
        seller.setBankName(cleanNullable(request.getBankName()));
        seller.setBankAccountName(cleanNullable(request.getBankAccountName()));
        seller.setBankAccountNumber(cleanNullable(request.getBankAccountNumber()));
        seller.setStatus(Seller.Status.pending);
        seller.setIsVerified(false);
        seller.setAdminNote(null);
        seller.setReviewedAt(null);
        seller.setTermsAcceptedAt(LocalDateTime.now());
        seller.setTermsVersion(TERMS_VERSION);

        Seller saved = sellerRepository.save(seller);
        return ResponseData.ok("Gửi đơn đăng ký thành công", SellerResponse.fromEntity(saved));
    }

    @GetMapping("/api/admin/seller-applications")
    public ResponseData<Page<SellerResponse>> adminListApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Seller.Status status
    ) {
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;
        return ResponseData.ok(
                sellerRepository.findAllApplicationsWithFilter(
                                searchTrimmed,
                                status,
                                PageRequest.of(page, size, Sort.by("createdAt").descending())
                        )
                        .map(SellerResponse::fromEntity)
        );
    }

    @PutMapping("/api/admin/seller-applications/{id}/approve")
    @Transactional
    public ResponseData<SellerResponse> approveApplication(@PathVariable Long id) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hồ sơ seller không tồn tại"));
        if (seller.getStatus() != Seller.Status.pending) {
            throw new IllegalArgumentException("Chỉ có thể duyệt hồ sơ đang chờ duyệt");
        }

        User user = seller.getUser();
        if (user == null) {
            throw new IllegalArgumentException("Hồ sơ seller không có người dùng hợp lệ");
        }

        user.setRole(Role.SELLER);
        userRepository.save(user);

        seller.setStatus(Seller.Status.active);
        seller.setIsVerified(true);
        seller.setReviewedAt(LocalDateTime.now());
        Seller saved = sellerRepository.save(seller);
        return ResponseData.ok("Duyệt hồ sơ seller thành công", SellerResponse.fromEntity(saved));
    }

    @PutMapping("/api/admin/seller-applications/{id}/reject")
    @Transactional
    public ResponseData<SellerResponse> rejectApplication(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ReviewSellerApplicationRequest request
    ) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hồ sơ seller không tồn tại"));
        if (seller.getStatus() != Seller.Status.pending) {
            throw new IllegalArgumentException("Chỉ có thể từ chối hồ sơ đang chờ duyệt");
        }

        User user = seller.getUser();
        if (user != null && user.getRole() == Role.SELLER) {
            user.setRole(Role.CUSTOMER);
            userRepository.save(user);
        }

        seller.setStatus(Seller.Status.closed);
        seller.setIsVerified(false);
        seller.setReviewedAt(LocalDateTime.now());
        seller.setAdminNote(request != null ? cleanNullable(request.getAdminNote()) : null);
        Seller saved = sellerRepository.save(seller);
        return ResponseData.ok("Từ chối hồ sơ seller thành công", SellerResponse.fromEntity(saved));
    }

    @PostMapping("/api/seller-applications/upload")
    public ResponseData<String> uploadApplicationImage(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) {
        resolveUser(auth);
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }
        return ResponseData.ok(
                "Tải ảnh thành công",
                cloudinaryService.uploadImage(file, "foodrescue/seller-applications")
        );
    }

    private User resolveUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Chưa đăng nhập");
        }
        String email = String.valueOf(auth.getPrincipal());
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }

    private void ensureEligibleApplicant(User user) {
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Tài khoản quản trị không thể đăng ký làm nhà bán hàng");
        }
    }

    private void validateShopSlug(String shopSlug, Long userId) {
        if (sellerRepository.existsByShopSlug(shopSlug, userId)) {
            throw new IllegalArgumentException("Slug cửa hàng đã được sử dụng");
        }
    }

    private String generateSellerCode(Long userId) {
        return "SLR-" + userId + "-" + (System.currentTimeMillis() % 1_000_000);
    }

    private String normalizeSlug(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return normalized;
        }
        return normalized.replaceAll("[^a-z0-9-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
