package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.AddressRequest;
import com.foodrescue.foodrescue_be.dto.response.AddressResponse;
import com.foodrescue.foodrescue_be.model.CustomerAddress;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.repository.CustomerAddressRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import com.foodrescue.foodrescue_be.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final CustomerAddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(AddressResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        List<CustomerAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);

        // First address is always default; otherwise use the requested value
        boolean makeDefault = existing.isEmpty() || Boolean.TRUE.equals(request.getIsDefault());

        // If new address is default, unset all existing defaults
        if (makeDefault && !existing.isEmpty()) {
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
        }

        CustomerAddress address = CustomerAddress.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressLine(request.getAddressLine())
                .note(request.getNote())
                .isDefault(makeDefault)
                .build();

        return AddressResponse.fromEntity(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa địa chỉ này");
        }

        // If setting as default, unset all other defaults first
        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            List<CustomerAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
        }

        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setAddressLine(request.getAddressLine());
        address.setNote(request.getNote());
        if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        return AddressResponse.fromEntity(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa địa chỉ này");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);

        // If deleted address was default, promote the next address to default
        if (wasDefault) {
            List<CustomerAddress> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        CustomerAddress target = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (!target.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền thay đổi địa chỉ này");
        }

        // Unset all existing defaults for this user
        List<CustomerAddress> all = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        all.forEach(a -> a.setIsDefault(false));
        addressRepository.saveAll(all);

        // Set the target as default
        target.setIsDefault(true);
        return AddressResponse.fromEntity(addressRepository.save(target));
    }
}
