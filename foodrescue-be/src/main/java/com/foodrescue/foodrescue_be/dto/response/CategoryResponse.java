package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.Category;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class CategoryResponse {
    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private Integer level;
    private Integer sortOrder;
    private Boolean isActive;
    private List<CategoryResponse> children;

    public static CategoryResponse fromEntity(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .name(c.getName())
                .slug(c.getSlug())
                .level(c.getLevel())
                .sortOrder(c.getSortOrder())
                .children(c.getChildren() != null
                        ? c.getChildren().stream()
                              .filter(ch -> Boolean.TRUE.equals(ch.getIsActive()))
                              .map(CategoryResponse::fromEntity)
                              .collect(Collectors.toList())
                        : null)
                .build();
    }

    public static CategoryResponse fromAdminEntity(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .name(c.getName())
                .slug(c.getSlug())
                .level(c.getLevel())
                .sortOrder(c.getSortOrder())
                .isActive(c.getIsActive())
                .children(c.getChildren() != null
                        ? c.getChildren().stream()
                              .map(CategoryResponse::fromAdminEntity)
                              .collect(Collectors.toList())
                        : null)
                .build();
    }
}
