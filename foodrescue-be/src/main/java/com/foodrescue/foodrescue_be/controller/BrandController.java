package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.request.BrandRequest;
import com.foodrescue.foodrescue_be.dto.response.BrandResponse;
import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.model.Brand;
import com.foodrescue.foodrescue_be.repository.BrandRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    // ── Public ──────────────────────────────────────────────────────────────

    @GetMapping("/api/brands")
    public ResponseData<List<BrandResponse>> listActive() {
        return ResponseData.ok(
                brandRepository.findByIsActiveTrueOrderByNameAsc()
                        .stream()
                        .map(BrandResponse::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    @GetMapping("/api/admin/brands")
    public ResponseData<List<BrandResponse>> adminListAll() {
        return ResponseData.ok(
                brandRepository.findAllByOrderByNameAsc()
                        .stream()
                        .map(BrandResponse::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @PostMapping("/api/admin/brands")
    public ResponseData<BrandResponse> create(@RequestBody @Valid BrandRequest req) {
        if (brandRepository.existsBySlug(req.getSlug())) {
            throw new IllegalArgumentException("Slug đã tồn tại");
        }
        Brand brand = Brand.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();
        return ResponseData.ok("Tạo thương hiệu thành công", BrandResponse.fromEntity(brandRepository.save(brand)));
    }

    @PutMapping("/api/admin/brands/{id}")
    public ResponseData<BrandResponse> update(@PathVariable Long id, @RequestBody @Valid BrandRequest req) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Thương hiệu không tồn tại"));
        if (brandRepository.existsBySlugAndIdNot(req.getSlug(), id)) {
            throw new IllegalArgumentException("Slug đã được sử dụng bởi thương hiệu khác");
        }
        brand.setName(req.getName());
        brand.setSlug(req.getSlug());
        brand.setDescription(req.getDescription());
        if (req.getIsActive() != null) brand.setIsActive(req.getIsActive());
        return ResponseData.ok("Cập nhật thương hiệu thành công", BrandResponse.fromEntity(brandRepository.save(brand)));
    }

    @DeleteMapping("/api/admin/brands/{id}")
    public ResponseData<Void> delete(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Thương hiệu không tồn tại"));
        // Soft delete: mark inactive instead of hard delete (products may reference it)
        brand.setIsActive(false);
        brandRepository.save(brand);
        return ResponseData.ok("Đã vô hiệu hóa thương hiệu", null);
    }

    @PutMapping("/api/admin/brands/{id}/restore")
    public ResponseData<BrandResponse> restore(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Thương hiệu không tồn tại"));
        brand.setIsActive(true);
        return ResponseData.ok("Đã kích hoạt lại thương hiệu", BrandResponse.fromEntity(brandRepository.save(brand)));
    }
}
