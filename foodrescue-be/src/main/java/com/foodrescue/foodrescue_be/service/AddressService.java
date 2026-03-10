package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.AddressRequest;
import com.foodrescue.foodrescue_be.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getAddresses(Long userId);
    AddressResponse createAddress(Long userId, AddressRequest request);
    AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request);
    void deleteAddress(Long userId, Long addressId);
    AddressResponse setDefault(Long userId, Long addressId);
}
