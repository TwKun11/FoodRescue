package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.CategoryRequest;
import com.foodrescue.foodrescue_be.dto.response.CategoryResponse;
import com.foodrescue.foodrescue_be.model.Category;
import com.foodrescue.foodrescue_be.repository.CategoryRepository;
import com.foodrescue.foodrescue_be.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllWithChildren() {
        List<Category> roots = categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        return roots.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllForAdmin() {
        List<Category> roots = categoryRepository.findByParentIsNullOrderBySortOrderAsc();
        return roots.stream()
                .map(CategoryResponse::fromAdminEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest req) {
        Category cat = new Category();
        cat.setName(req.getName());
        cat.setSlug(req.getSlug());
        cat.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        cat.setIsActive(req.getIsActive() != null ? req.getIsActive() : Boolean.TRUE);
        if (req.getParentId() != null) {
            Category parent = categoryRepository.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            cat.setParent(parent);
            cat.setLevel(parent.getLevel() + 1);
        } else {
            cat.setLevel(1);
        }
        return CategoryResponse.fromAdminEntity(categoryRepository.save(cat));
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (req.getName() != null) cat.setName(req.getName());
        if (req.getSlug() != null) cat.setSlug(req.getSlug());
        if (req.getSortOrder() != null) cat.setSortOrder(req.getSortOrder());
        if (req.getIsActive() != null) cat.setIsActive(req.getIsActive());
        if (req.getParentId() != null) {
            Category parent = categoryRepository.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            cat.setParent(parent);
            cat.setLevel(parent.getLevel() + 1);
        }
        return CategoryResponse.fromAdminEntity(categoryRepository.save(cat));
    }

    @Override
    public void deleteCategory(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setIsActive(false);
        categoryRepository.save(cat);
    }
}
