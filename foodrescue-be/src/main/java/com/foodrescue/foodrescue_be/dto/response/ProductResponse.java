package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Product;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder(toBuilder = true)
public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerName;
    private String sellerSlug;
    private String sellerPhone;
    private String sellerPickupAddress;
    private Double sellerLatitude;
    private Double sellerLongitude;
    private BigDecimal sellerRatingAvg;
    private Boolean sellerVerified;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String productCode;
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
    private Integer minPreparationMinutes;
    private String status;
    private String primaryImageUrl;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;

    public static ProductResponse fromEntity(Product product, String primaryImageUrl, List<ProductVariantResponse> variants) {
        return ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getShopName() : null)
                .sellerSlug(product.getSeller() != null ? product.getSeller().getShopSlug() : null)
                .sellerPhone(product.getSeller() != null ? product.getSeller().getPhone() : null)
                .sellerPickupAddress(product.getSeller() != null ? product.getSeller().getPickupAddress() : null)
                .sellerLatitude(product.getSeller() != null ? product.getSeller().getLatitude() : null)
                .sellerLongitude(product.getSeller() != null ? product.getSeller().getLongitude() : null)
                .sellerRatingAvg(product.getSeller() != null ? product.getSeller().getRatingAvg() : null)
                .sellerVerified(product.getSeller() != null ? product.getSeller().getIsVerified() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .productCode(product.getProductCode())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .productType(product.getProductType() != null ? product.getProductType().name() : null)
                .sellMode(product.getSellMode() != null ? product.getSellMode().name() : null)
                .storageType(product.getStorageType() != null ? product.getStorageType().name() : null)
                .originCountry(product.getOriginCountry())
                .originProvince(product.getOriginProvince())
                .shelfLifeDays(product.getShelfLifeDays())
                .minPreparationMinutes(product.getMinPreparationMinutes())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .primaryImageUrl(primaryImageUrl)
                .variants(variants)
                .build();
    }

    public static ProductResponse fromEntityWithImages(Product product, String primaryImageUrl,
                                                       List<ProductImageResponse> images,
                                                       List<ProductVariantResponse> variants) {
        return fromEntity(product, primaryImageUrl, variants).toBuilder()
                .images(images)
                .build();
    }
}
