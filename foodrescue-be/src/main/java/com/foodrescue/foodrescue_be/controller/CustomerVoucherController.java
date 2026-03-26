package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.CustomerVoucherResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.dto.response.VoucherPreviewResponse;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserVoucher;
import com.foodrescue.foodrescue_be.model.Voucher;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.repository.UserVoucherRepository;
import com.foodrescue.foodrescue_be.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class CustomerVoucherController {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;

    @GetMapping("/store")
    public ResponseData<List<CustomerVoucherResponse>> getVoucherStore(Authentication auth) {
        Long userId = resolveUserId(auth);
        LocalDateTime now = LocalDateTime.now();

        List<UserVoucher> mine = userVoucherRepository.findByUserIdOrderByClaimedAtDesc(userId);
        Map<Long, UserVoucher> mineByVoucherId = mine.stream()
                .collect(Collectors.toMap(v -> v.getVoucher().getId(), Function.identity(), (a, b) -> a));

        List<CustomerVoucherResponse> data = voucherRepository.findAll().stream()
                .filter(v -> v.getStatus() == Voucher.Status.active)
                .filter(v -> v.getActiveFrom() == null || !v.getActiveFrom().isAfter(now))
                .filter(v -> v.getActiveUntil() == null || !v.getActiveUntil().isBefore(now))
                .filter(v -> v.getMaxUses() == null || (v.getUsedCount() != null ? v.getUsedCount() : 0) < v.getMaxUses())
                .sorted(Comparator.comparing(Voucher::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(v -> CustomerVoucherResponse.from(v, mineByVoucherId.get(v.getId())))
                .toList();

        return ResponseData.ok(data);
    }

    @GetMapping("/my")
    public ResponseData<List<CustomerVoucherResponse>> getMyVouchers(Authentication auth) {
        Long userId = resolveUserId(auth);

        List<CustomerVoucherResponse> data = userVoucherRepository.findByUserIdOrderByClaimedAtDesc(userId).stream()
                .map(uv -> CustomerVoucherResponse.from(uv.getVoucher(), uv))
                .toList();

        return ResponseData.ok(data);
    }

    @PostMapping("/{voucherId}/claim")
    @Transactional
    public ResponseData<CustomerVoucherResponse> claimVoucher(Authentication auth, @PathVariable Long voucherId) {
        Long userId = resolveUserId(auth);
        LocalDateTime now = LocalDateTime.now();

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại"));

        if (voucher.getStatus() != Voucher.Status.active) {
            throw new IllegalArgumentException("Voucher không còn hoạt động");
        }
        if (voucher.getActiveFrom() != null && voucher.getActiveFrom().isAfter(now)) {
            throw new IllegalArgumentException("Voucher chưa đến thời gian nhận");
        }
        if (voucher.getActiveUntil() != null && voucher.getActiveUntil().isBefore(now)) {
            throw new IllegalArgumentException("Voucher đã hết hạn");
        }
        Integer maxUses = voucher.getMaxUses();
        Integer usedCount = voucher.getUsedCount() != null ? voucher.getUsedCount() : 0;
        if (maxUses != null && usedCount >= maxUses) {
            throw new IllegalArgumentException("Voucher đã hết lượt sử dụng");
        }
        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)) {
            throw new IllegalArgumentException("Bạn đã nhận voucher này rồi");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        UserVoucher claimed = userVoucherRepository.save(UserVoucher.builder()
                .user(user)
                .voucher(voucher)
                .status(UserVoucher.Status.claimed)
                .claimedAt(now)
                .build());

        return ResponseData.ok("Nhận voucher thành công", CustomerVoucherResponse.from(voucher, claimed));
    }

    @GetMapping("/preview")
    @Transactional(readOnly = true)
    public ResponseData<VoucherPreviewResponse> previewVoucher(
            Authentication auth,
            @RequestParam String code,
            @RequestParam BigDecimal orderValue,
            @RequestParam(required = false) BigDecimal totalQuantity,
            @RequestParam(required = false) String province
    ) {
        Long userId = resolveUserId(auth);
        if (orderValue == null || orderValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị đơn hàng không hợp lệ");
        }

        String voucherCode = code.trim();
        if (voucherCode.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mã voucher");
        }

        UserVoucher userVoucher = userVoucherRepository
                .findByUserIdAndVoucher_CodeIgnoreCaseAndStatus(userId, voucherCode, UserVoucher.Status.claimed)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa nhận voucher này hoặc voucher đã được dùng"));

        Voucher voucher = userVoucher.getVoucher();
        LocalDateTime now = LocalDateTime.now();

        if (voucher.getStatus() != Voucher.Status.active) {
            throw new IllegalArgumentException("Voucher không còn hoạt động");
        }
        if (voucher.getActiveFrom() != null && voucher.getActiveFrom().isAfter(now)) {
            throw new IllegalArgumentException("Voucher chưa đến thời gian áp dụng");
        }
        if (voucher.getActiveUntil() != null && voucher.getActiveUntil().isBefore(now)) {
            throw new IllegalArgumentException("Voucher đã hết hạn");
        }

        BigDecimal minOrderValue = voucher.getMinOrderValue() != null ? voucher.getMinOrderValue() : BigDecimal.ZERO;
        if (orderValue.compareTo(minOrderValue) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher");
        }

        Integer maxUses = voucher.getMaxUses();
        Integer usedCount = voucher.getUsedCount() != null ? voucher.getUsedCount() : 0;
        if (maxUses != null && usedCount >= maxUses) {
            throw new IllegalArgumentException("Voucher đã hết lượt sử dụng");
        }

        BigDecimal qty = totalQuantity != null ? totalQuantity : BigDecimal.ZERO;
        if (voucher.getComboItemThreshold() != null
                && qty.compareTo(BigDecimal.valueOf(voucher.getComboItemThreshold())) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đủ số lượng sản phẩm để áp voucher");
        }

        if (voucher.getTargetProvince() != null && !voucher.getTargetProvince().isBlank()) {
            if (province == null || province.isBlank()) {
                throw new IllegalArgumentException("Voucher yêu cầu có địa chỉ giao hàng hợp lệ");
            }
            if (!voucher.getTargetProvince().trim().equalsIgnoreCase(province.trim())) {
                throw new IllegalArgumentException("Voucher không áp dụng cho khu vực giao hàng hiện tại");
            }
        }

        if (voucher.getDiscountType() == Voucher.DiscountType.freeship) {
            throw new IllegalArgumentException("Voucher freeship chưa hỗ trợ cho luồng click and collect");
        }

        BigDecimal discount = calculateDiscountAmount(voucher, orderValue);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Voucher không tạo ra giá trị giảm hợp lệ");
        }

        return ResponseData.ok(VoucherPreviewResponse.builder()
                .code(voucher.getCode())
                .orderValue(orderValue)
                .discountAmount(discount)
                .finalTotal(orderValue.subtract(discount))
                .build());
    }

    private BigDecimal calculateDiscountAmount(Voucher voucher, BigDecimal orderValue) {
        BigDecimal discount;
        if (voucher.getDiscountType() == Voucher.DiscountType.percentage) {
            discount = orderValue
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(voucher.getMaxDiscountAmount());
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        if (discount == null || discount.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        if (discount.compareTo(orderValue) > 0) {
            return orderValue;
        }
        return discount;
    }

    private Long resolveUserId(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }
}