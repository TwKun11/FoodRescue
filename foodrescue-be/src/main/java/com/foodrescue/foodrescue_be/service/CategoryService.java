package com.foodrescue.foodrescue_be.service;

import com.foodrescue.foodrescue_be.dto.request.CategoryRequest;
import com.foodrescue.foodrescue_be.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllWithChildren();
    List<CategoryResponse> getAllForAdmin();
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
