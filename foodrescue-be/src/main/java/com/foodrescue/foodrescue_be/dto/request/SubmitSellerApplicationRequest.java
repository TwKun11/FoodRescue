package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitSellerApplicationRequest {

    @NotBlank(message = "Ten cua hang khong duoc de trong")
    @Size(max = 255, message = "Ten cua hang qua dai")
    private String shopName;

    @NotBlank(message = "Slug cua hang khong duoc de trong")
    @Size(min = 3, max = 120, message = "Slug cua hang phai tu 3 den 120 ky tu")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chi duoc chua chu thuong, so va dau gach ngang")
    private String shopSlug;

    @NotBlank(message = "Ten phap ly / ho kinh doanh khong duoc de trong")
    @Size(max = 255, message = "Ten phap ly qua dai")
    private String legalName;

    @NotBlank(message = "Loai hinh kinh doanh khong duoc de trong")
    @Size(max = 100, message = "Loai hinh kinh doanh qua dai")
    private String businessType;

    @NotBlank(message = "Ten nguoi lien he khong duoc de trong")
    @Size(max = 255, message = "Ten nguoi lien he qua dai")
    private String contactName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Size(max = 30, message = "So dien thoai qua dai")
    @Pattern(regexp = "^\\d{10,11}$", message = "So dien thoai phai gom 10 den 11 chu so")
    private String phone;

    @NotBlank(message = "Dia chi lay hang khong duoc de trong")
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

    @NotBlank(message = "So giay phep kinh doanh khong duoc de trong")
    @Size(max = 100, message = "So giay phep kinh doanh qua dai")
    private String businessLicenseNumber;

    @NotBlank(message = "So CCCD/CMND dai dien khong duoc de trong")
    @Size(max = 50, message = "So CCCD/CMND qua dai")
    @Pattern(regexp = "^\\d{9,20}$", message = "So CCCD/CMND phai gom 9 den 20 chu so")
    private String identityNumber;

    @Size(max = 2000, message = "Mo ta khong duoc vuot qua 2000 ky tu")
    private String description;

    @NotBlank(message = "Anh mat tien / quay ban la bat buoc")
    @Size(max = 1000, message = "Link anh mat tien qua dai")
    private String storefrontImageUrl;

    @NotBlank(message = "Anh giay phep kinh doanh la bat buoc")
    @Size(max = 1000, message = "Link anh giay phep qua dai")
    private String businessLicenseImageUrl;

    @NotBlank(message = "Anh CCCD/CMND la bat buoc")
    @Size(max = 1000, message = "Link anh CCCD/CMND qua dai")
    private String identityCardImageUrl;

    @NotBlank(message = "Ten ngan hang khong duoc de trong")
    @Size(max = 150, message = "Ten ngan hang qua dai")
    private String bankName;

    @NotBlank(message = "Chu tai khoan khong duoc de trong")
    @Size(max = 255, message = "Ten chu tai khoan qua dai")
    private String bankAccountName;

    @NotBlank(message = "So tai khoan khong duoc de trong")
    @Size(max = 100, message = "So tai khoan qua dai")
    @Pattern(regexp = "^\\d{6,30}$", message = "So tai khoan phai gom 6 den 30 chu so")
    private String bankAccountNumber;

    @AssertTrue(message = "Ban phai dong y dieu khoan su dung")
    private Boolean acceptedTerms;
}
