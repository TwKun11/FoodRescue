package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.CategoryRequest;
import com.foodrescue.foodrescue_be.dto.response.CategoryResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseData<List<CategoryResponse>> getAll() {
        return ResponseData.ok(categoryService.getAllForAdmin());
    }

    @PostMapping
    public ResponseData<CategoryResponse> create(@RequestBody CategoryRequest request) {
        return ResponseData.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseData<CategoryResponse> update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return ResponseData.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseData.ok(null);
    }
}
