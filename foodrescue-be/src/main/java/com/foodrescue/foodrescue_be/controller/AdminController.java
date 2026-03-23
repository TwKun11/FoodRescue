package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.SellerResponse;
import com.foodrescue.foodrescue_be.dto.response.UserResponse;
import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

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
        return ResponseData.ok(
                sellerRepository.findAllWithFilter(searchTrimmed, status,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                        .map(SellerResponse::fromEntity)
        );
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
}
