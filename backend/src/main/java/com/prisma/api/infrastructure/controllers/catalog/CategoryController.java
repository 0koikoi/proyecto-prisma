package com.prisma.api.infrastructure.controllers.catalog;

import com.prisma.api.application.dto.catalog.CatalogDtos.*;
import com.prisma.api.application.services.CatalogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/categories")
@Validated
public class CategoryController {
    private final CatalogService catalog;

    public CategoryController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public PageResponse<CategoryResponse> list(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @Size(max = 200) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return catalog.listCategories(active, q, page, size);
    }

    @GetMapping("/{id}")
    public CategoryResponse get(@PathVariable @Positive Long id) {
        return catalog.getCategory(id);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = catalog.createCategory(request);
        return ResponseEntity.created(URI.create("/api/categories/" + category.id())).body(category);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable @Positive Long id, @Valid @RequestBody CategoryRequest request) {
        return catalog.updateCategory(id, request);
    }

    @PatchMapping("/{id}/active")
    public CategoryResponse setActive(@PathVariable @Positive Long id, @Valid @RequestBody ActiveRequest request) {
        return catalog.setCategoryActive(id, request.isActive());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
        catalog.setCategoryActive(id, false);
        return ResponseEntity.noContent().build();
    }
}
