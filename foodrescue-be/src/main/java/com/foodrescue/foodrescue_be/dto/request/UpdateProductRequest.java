package com.foodrescue.foodrescue_be.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateProductRequest {

    private Long categoryId;
    private Long brandId;
    private String name;
    private String slug;
    private String shortDescription;
    private String description;
    private String productType;
    private String sellMode;
    private String storageType;
    private String originCountry;
    private String originProvince;
    private Integer shelfLifeDays;
    private String status;
    private List<String> imageUrls;
}
