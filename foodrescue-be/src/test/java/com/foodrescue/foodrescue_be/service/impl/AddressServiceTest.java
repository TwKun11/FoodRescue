package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.AddressRequest;
import com.foodrescue.foodrescue_be.dto.response.AddressResponse;
import com.foodrescue.foodrescue_be.model.CustomerAddress;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.repository.CustomerAddressRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private CustomerAddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressServiceImpl addressService;

    @Test
    void createAddress_setsFirstAddressAsDefault() {
        User user = user(1L);
        AddressRequest request = addressRequest(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(1L)).thenReturn(List.of());
        when(addressRepository.save(any(CustomerAddress.class))).thenAnswer(invocation -> {
            CustomerAddress saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        AddressResponse response = addressService.createAddress(1L, request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getReceiverName()).isEqualTo("Nguyen Van A");
        assertThat(response.getIsDefault()).isTrue();
    }

    @Test
    void updateAddress_unsetsOtherDefaultsWhenNewDefaultIsSelected() {
        User user = user(1L);
        CustomerAddress current = address(20L, user, false, "Old name");
        CustomerAddress existingDefault = address(21L, user, true, "Default");
        AddressRequest request = addressRequest(true);
        request.setReceiverName("New name");

        when(addressRepository.findById(20L)).thenReturn(Optional.of(current));
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(1L))
                .thenReturn(List.of(existingDefault, current));
        when(addressRepository.save(any(CustomerAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AddressResponse response = addressService.updateAddress(1L, 20L, request);

        assertThat(existingDefault.getIsDefault()).isFalse();
        assertThat(current.getIsDefault()).isTrue();
        assertThat(response.getReceiverName()).isEqualTo("New name");
        verify(addressRepository).saveAll(List.of(existingDefault, current));
    }

    @Test
    void deleteAddress_promotesNextAddressWhenDeletingDefault() {
        User user = user(1L);
        CustomerAddress deleted = address(30L, user, true, "Primary");
        CustomerAddress fallback = address(31L, user, false, "Fallback");

        when(addressRepository.findById(30L)).thenReturn(Optional.of(deleted));
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(1L)).thenReturn(List.of(fallback));
        when(addressRepository.save(any(CustomerAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        addressService.deleteAddress(1L, 30L);

        assertThat(fallback.getIsDefault()).isTrue();
        verify(addressRepository).delete(deleted);
        verify(addressRepository).save(fallback);
    }

    @Test
    void setDefault_throwsWhenAddressBelongsToAnotherUser() {
        CustomerAddress foreignAddress = address(40L, user(2L), false, "Foreign");

        when(addressRepository.findById(40L)).thenReturn(Optional.of(foreignAddress));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> addressService.setDefault(1L, 40L));

        assertThat(exception.getMessage()).contains("quy");
    }

    private User user(Long id) {
        return User.builder()
                .id(id)
                .email("user" + id + "@example.com")
                .fullName("User " + id)
                .build();
    }

    private CustomerAddress address(Long id, User user, boolean isDefault, String receiverName) {
        return CustomerAddress.builder()
                .id(id)
                .user(user)
                .receiverName(receiverName)
                .receiverPhone("0900000000")
                .province("Ho Chi Minh")
                .district("Thu Duc")
                .ward("Linh Trung")
                .addressLine("12 Street")
                .isDefault(isDefault)
                .build();
    }

    private AddressRequest addressRequest(boolean isDefault) {
        AddressRequest request = new AddressRequest();
        request.setReceiverName("Nguyen Van A");
        request.setReceiverPhone("0901234567");
        request.setProvince("Ho Chi Minh");
        request.setDistrict("Thu Duc");
        request.setWard("Linh Trung");
        request.setAddressLine("12 Street");
        request.setNote("Gate 1");
        request.setIsDefault(isDefault);
        return request;
    }
}
