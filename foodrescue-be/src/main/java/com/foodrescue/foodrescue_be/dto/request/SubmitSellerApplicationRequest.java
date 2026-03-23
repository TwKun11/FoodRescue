package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitSellerApplicationRequest {

    @NotBlank(message = "Tên cửa hàng không được để trống")
    @Size(max = 255, message = "Tên cửa hàng quá dài")
    private String shopName;

    @NotBlank(message = "Slug cửa hàng không được để trống")
    @Size(min = 3, max = 120, message = "Slug cửa hàng phải từ 3 đến 120 ký tự")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    private String shopSlug;

    @NotBlank(message = "Tên pháp lý / hộ kinh doanh không được để trống")
    @Size(max = 255, message = "Tên pháp lý quá dài")
    private String legalName;

    @NotBlank(message = "Loại hình kinh doanh không được để trống")
    @Size(max = 100, message = "Loại hình kinh doanh quá dài")
    private String businessType;

    @NotBlank(message = "Tên người liên hệ không được để trống")
    @Size(max = 255, message = "Tên người liên hệ quá dài")
    private String contactName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 30, message = "Số điện thoại quá dài")
    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải gồm 10 đến 11 chữ số")
    private String phone;

    @NotBlank(message = "Địa chỉ lấy hàng không được để trống")
    @Size(max = 1000, message = "Địa chỉ lấy hàng quá dài")
    private String pickupAddress;

    @Size(max = 50, message = "Mã số thuế quá dài")
    private String taxCode;

    @NotBlank(message = "Số giấy phép kinh doanh không được để trống")
    @Size(max = 100, message = "Số giấy phép kinh doanh quá dài")
    private String businessLicenseNumber;

    @NotBlank(message = "Số CCCD/CMND đại diện không được để trống")
    @Size(max = 50, message = "Số CCCD/CMND quá dài")
    @Pattern(regexp = "^\\d{9,20}$", message = "Số CCCD/CMND phải gồm 9 đến 20 chữ số")
    private String identityNumber;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotBlank(message = "Ảnh mặt tiền / quầy bán là bắt buộc")
    @Size(max = 1000, message = "Link ảnh mặt tiền quá dài")
    private String storefrontImageUrl;

    @NotBlank(message = "Ảnh giấy phép kinh doanh là bắt buộc")
    @Size(max = 1000, message = "Link ảnh giấy phép quá dài")
    private String businessLicenseImageUrl;

    @NotBlank(message = "Ảnh CCCD/CMND là bắt buộc")
    @Size(max = 1000, message = "Link ảnh CCCD/CMND quá dài")
    private String identityCardImageUrl;

    @NotBlank(message = "Tên ngân hàng không được để trống")
    @Size(max = 150, message = "Tên ngân hàng quá dài")
    private String bankName;

    @NotBlank(message = "Chủ tài khoản không được để trống")
    @Size(max = 255, message = "Tên chủ tài khoản quá dài")
    private String bankAccountName;

    @NotBlank(message = "Số tài khoản không được để trống")
    @Size(max = 100, message = "Số tài khoản quá dài")
    @Pattern(regexp = "^\\d{6,30}$", message = "Số tài khoản phải gồm 6 đến 30 chữ số")
    private String bankAccountNumber;

    @AssertTrue(message = "Bạn phải đồng ý điều khoản sử dụng")
    private Boolean acceptedTerms;
}
