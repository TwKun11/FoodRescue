package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Brand;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static BrandResponse fromEntity(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .description(brand.getDescription())
                .isActive(brand.getIsActive())
                .createdAt(brand.getCreatedAt())
                .build();
    }
}
