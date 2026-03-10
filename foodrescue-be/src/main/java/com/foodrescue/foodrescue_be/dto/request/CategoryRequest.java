package com.foodrescue.foodrescue_be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {
    private String name;
    private String slug;
    private Long parentId;
    private Integer sortOrder;
    private Boolean isActive;
}
