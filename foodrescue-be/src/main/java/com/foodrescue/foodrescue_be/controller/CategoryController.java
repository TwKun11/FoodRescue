package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.CategoryResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseData<List<CategoryResponse>> getAll() {
        return ResponseData.ok(categoryService.getAllWithChildren());
    }
}
