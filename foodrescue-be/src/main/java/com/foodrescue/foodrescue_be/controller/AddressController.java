package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.AddressRequest;
import com.foodrescue.foodrescue_be.dto.response.AddressResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseData<List<AddressResponse>> getAddresses(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseData.ok(addressService.getAddresses(userId));
    }

    @PostMapping
    public ResponseData<AddressResponse> createAddress(
            Authentication auth,
            @RequestBody @Valid AddressRequest request
    ) {
        Long userId = resolveUserId(auth);
        return ResponseData.ok("Thêm địa chỉ thành công", addressService.createAddress(userId, request));
    }

    @PutMapping("/{addressId}")
    public ResponseData<AddressResponse> updateAddress(
            Authentication auth,
            @PathVariable Long addressId,
            @RequestBody @Valid AddressRequest request
    ) {
        Long userId = resolveUserId(auth);
        return ResponseData.ok("Cập nhật địa chỉ thành công", addressService.updateAddress(userId, addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ResponseData<Void> deleteAddress(
            Authentication auth,
            @PathVariable Long addressId
    ) {
        Long userId = resolveUserId(auth);
        addressService.deleteAddress(userId, addressId);
        return ResponseData.ok("Xóa địa chỉ thành công", null);
    }

    @PutMapping("/{addressId}/default")
    public ResponseData<AddressResponse> setDefault(
            Authentication auth,
            @PathVariable Long addressId
    ) {
        Long userId = resolveUserId(auth);
        return ResponseData.ok("Đã đặt làm địa chỉ mặc định", addressService.setDefault(userId, addressId));
    }

    private Long resolveUserId(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }
}
