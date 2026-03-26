package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.AdminStatsResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.SellerResponse;
import com.foodrescue.foodrescue_be.dto.response.UserResponse;
import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import com.foodrescue.foodrescue_be.repository.ReviewRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.service.AdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ReviewRepository reviewRepository;
    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ResponseData<AdminStatsResponse> getStats() {
        return ResponseData.ok(adminService.getAdminStats());
    }

    // ── Users ──────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseData<Page<UserResponse>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status
    ) {
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;
        return ResponseData.ok(
                userRepository.findAllWithFilter(searchTrimmed, role, status,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                        .map(UserResponse::fromEntity)
        );
    }

    @PutMapping("/users/{id}/status")
    public ResponseData<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        user.setStatus(status);
        return ResponseData.ok("Cập nhật trạng thái thành công", UserResponse.fromEntity(userRepository.save(user)));
    }

    // ── Sellers ────────────────────────────────────────────────────────────

    @GetMapping("/sellers")
    public ResponseData<Page<SellerResponse>> listSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Seller.Status status
    ) {
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<SellerResponse> basePage = sellerRepository.findAllWithFilter(
                searchTrimmed,
                status,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
            )
            .map(SellerResponse::fromEntity);

        List<Long> sellerIds = basePage.getContent().stream()
            .map(SellerResponse::getId)
            .toList();

        Map<Long, BigDecimal> avgBySeller = new HashMap<>();
        Map<Long, Long> countBySeller = new HashMap<>();
        if (!sellerIds.isEmpty()) {
            for (Object[] row : reviewRepository.getSellerRatingSnapshot(sellerIds)) {
            if (row == null || row.length < 3 || row[0] == null) continue;
            Long sellerId = ((Number) row[0]).longValue();
            BigDecimal avg = row[1] instanceof BigDecimal
                ? (BigDecimal) row[1]
                : new BigDecimal(String.valueOf(row[1]));
            Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            avgBySeller.put(sellerId, avg);
            countBySeller.put(sellerId, count);
            }
        }

        Page<SellerResponse> enrichedPage = basePage.map(item -> item.toBuilder()
            .ratingAvg(avgBySeller.getOrDefault(item.getId(), BigDecimal.ZERO))
            .reviewCount(countBySeller.getOrDefault(item.getId(), 0L))
            .build());

        return ResponseData.ok(enrichedPage);
    }

    @PostMapping("/sellers")
    public ResponseData<SellerResponse> createSeller(@Valid @RequestBody CreateSellerRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        User user = User.builder()
                .email(req.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getContactName())
                .role(Role.SELLER)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Seller seller = Seller.builder()
                .user(user)
                .code(req.getCode().trim().toUpperCase())
                .shopName(req.getShopName())
                .shopSlug(req.getShopSlug())
                .contactName(req.getContactName())
                .phone(req.getPhone())
                .commissionRate(java.math.BigDecimal.ZERO)
                .status(Seller.Status.active)
                .isVerified(false)
                .build();

        return ResponseData.ok("Tạo cửa hàng thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    @PutMapping("/sellers/{id}/status")
    public ResponseData<SellerResponse> updateSellerStatus(
            @PathVariable Long id,
            @RequestParam Seller.Status status
    ) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));

        User owner = seller.getUser();
        if (owner != null) {
            if (status == Seller.Status.suspended || status == Seller.Status.closed) {
                owner.setStatus(UserStatus.LOCKED);
            } else if (status == Seller.Status.active) {
                owner.setStatus(UserStatus.ACTIVE);
            }
            userRepository.save(owner);
        }

        seller.setStatus(status);
        return ResponseData.ok("Cập nhật trạng thái thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    @PutMapping("/sellers/{id}/verify")
    public ResponseData<SellerResponse> verifySeller(@PathVariable Long id) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cửa hàng không tồn tại"));
        User user = seller.getUser();
        if (user != null && user.getRole() != Role.SELLER) {
            user.setRole(Role.SELLER);
            userRepository.save(user);
        }
        seller.setIsVerified(true);
        if (seller.getStatus() == Seller.Status.pending) seller.setStatus(Seller.Status.active);
        return ResponseData.ok("Xác minh cửa hàng thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    @PostMapping("/users/{id}/convert-to-seller")
    public ResponseData<SellerResponse> convertCustomerToSeller(
            @PathVariable Long id,
            @Valid @RequestBody ConvertToSellerRequest req
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        if (user.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Chỉ user với role CUSTOMER mới có thể convert thành SELLER");
        }

        // Check if seller already exists for this user
        if (sellerRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException("Người dùng này đã có hồ sơ seller");
        }

        // Update user role
        user.setRole(Role.SELLER);
        userRepository.save(user);

        // Create seller record
        Seller seller = Seller.builder()
                .user(user)
                .code(req.getCode().trim().toUpperCase())
                .shopName(req.getShopName())
                .shopSlug(req.getShopSlug())
                .contactName(req.getContactName())
                .phone(req.getPhone())
                .commissionRate(java.math.BigDecimal.ZERO)
                .status(Seller.Status.pending)
                .isVerified(false)
                .build();

        return ResponseData.ok("Chuyển đổi thành seller thành công", SellerResponse.fromEntity(sellerRepository.save(seller)));
    }

    // ── Inner DTO ──────────────────────────────────────────────────────────

    @Getter
    @Setter
    public static class CreateSellerRequest {
        @NotBlank private String email;
        @NotBlank private String password;
        @NotBlank private String code;
        @NotBlank private String shopName;
        @NotBlank private String shopSlug;
        @NotBlank private String contactName;
        private String phone;
    }

    @Getter
    @Setter
    public static class ConvertToSellerRequest {
        @NotBlank private String code;
        @NotBlank private String shopName;
        @NotBlank private String shopSlug;
        @NotBlank private String contactName;
        private String phone;
    }
}
