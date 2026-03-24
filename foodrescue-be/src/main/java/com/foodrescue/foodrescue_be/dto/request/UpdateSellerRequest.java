package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSellerRequest {
    @Size(max = 255, message = "Ten cua hang qua dai")
    private String shopName;

    @Size(max = 255, message = "Ten phap ly qua dai")
    private String legalName;

    @Size(max = 100, message = "Loai hinh kinh doanh qua dai")
    private String businessType;

    @Size(max = 255, message = "Ten nguoi lien he qua dai")
    private String contactName;

    @Size(max = 30, message = "So dien thoai qua dai")
    @Pattern(regexp = "^$|^\\d{10,11}$", message = "So dien thoai phai gom 10 den 11 chu so")
    private String phone;

    @Size(max = 1000, message = "Dia chi lay hang qua dai")
    private String pickupAddress;

    @DecimalMin(value = "-90.0", message = "Vi do khong hop le")
    @DecimalMax(value = "90.0", message = "Vi do khong hop le")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Kinh do khong hop le")
    @DecimalMax(value = "180.0", message = "Kinh do khong hop le")
    private Double longitude;

    @Size(max = 50, message = "Ma so thue qua dai")
    private String taxCode;

    @Size(max = 100, message = "So giay phep kinh doanh qua dai")
    private String businessLicenseNumber;

    @Size(max = 50, message = "So CCCD/CMND qua dai")
    @Pattern(regexp = "^$|^\\d{9,20}$", message = "So CCCD/CMND phai gom 9 den 20 chu so")
    private String identityNumber;

    @Size(max = 2000, message = "Mo ta khong duoc vuot qua 2000 ky tu")
    private String description;

    @Size(max = 1000, message = "Link avatar qua dai")
    private String avatarUrl;

    @Size(max = 1000, message = "Link anh bia qua dai")
    private String coverUrl;

    @Size(max = 1000, message = "Link anh mat tien qua dai")
    private String storefrontImageUrl;

    @Size(max = 1000, message = "Link anh giay phep qua dai")
    private String businessLicenseImageUrl;

    @Size(max = 1000, message = "Link anh CCCD/CMND qua dai")
    private String identityCardImageUrl;

    @Size(max = 150, message = "Ten ngan hang qua dai")
    private String bankName;

    @Size(max = 255, message = "Ten chu tai khoan qua dai")
    private String bankAccountName;

    @Size(max = 100, message = "So tai khoan qua dai")
    @Pattern(regexp = "^$|^\\d{6,30}$", message = "So tai khoan phai gom 6 den 30 chu so")
    private String bankAccountNumber;
}
