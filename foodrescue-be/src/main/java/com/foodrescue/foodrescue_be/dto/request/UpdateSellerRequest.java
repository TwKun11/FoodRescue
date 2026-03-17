package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSellerRequest {
    @Size(max = 255, message = "Tên cửa hàng quá dài")
    private String shopName;

    @Size(max = 255, message = "Tên pháp lý quá dài")
    private String legalName;

    @Size(max = 100, message = "Loại hình kinh doanh quá dài")
    private String businessType;

    @Size(max = 255, message = "Tên người liên hệ quá dài")
    private String contactName;

    @Size(max = 30, message = "Số điện thoại quá dài")
    @Pattern(regexp = "^$|^\\d{10,11}$", message = "Số điện thoại phải gồm 10 đến 11 chữ số")
    private String phone;

    @Size(max = 1000, message = "Địa chỉ lấy hàng quá dài")
    private String pickupAddress;

    @Size(max = 50, message = "Mã số thuế quá dài")
    private String taxCode;

    @Size(max = 100, message = "Số giấy phép kinh doanh quá dài")
    private String businessLicenseNumber;

    @Size(max = 50, message = "Số CCCD/CMND quá dài")
    @Pattern(regexp = "^$|^\\d{9,20}$", message = "Số CCCD/CMND phải gồm 9 đến 20 chữ số")
    private String identityNumber;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @Size(max = 1000, message = "Link avatar quá dài")
    private String avatarUrl;

    @Size(max = 1000, message = "Link ảnh bìa quá dài")
    private String coverUrl;

    @Size(max = 1000, message = "Link ảnh mặt tiền quá dài")
    private String storefrontImageUrl;

    @Size(max = 1000, message = "Link ảnh giấy phép quá dài")
    private String businessLicenseImageUrl;

    @Size(max = 1000, message = "Link ảnh CCCD/CMND quá dài")
    private String identityCardImageUrl;

    @Size(max = 150, message = "Tên ngân hàng quá dài")
    private String bankName;

    @Size(max = 255, message = "Tên chủ tài khoản quá dài")
    private String bankAccountName;

    @Size(max = 100, message = "Số tài khoản quá dài")
    @Pattern(regexp = "^$|^\\d{6,30}$", message = "Số tài khoản phải gồm 6 đến 30 chữ số")
    private String bankAccountNumber;
}
