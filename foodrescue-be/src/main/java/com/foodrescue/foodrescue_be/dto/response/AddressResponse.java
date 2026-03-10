package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.CustomerAddress;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AddressResponse {

    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String district;
    private String ward;
    private String addressLine;
    private String note;
    private Boolean isDefault;
    private LocalDateTime createdAt;

    public static AddressResponse fromEntity(CustomerAddress a) {
        return AddressResponse.builder()
                .id(a.getId())
                .receiverName(a.getReceiverName())
                .receiverPhone(a.getReceiverPhone())
                .province(a.getProvince())
                .district(a.getDistrict())
                .ward(a.getWard())
                .addressLine(a.getAddressLine())
                .note(a.getNote())
                .isDefault(a.getIsDefault())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
