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
@RequestMapping("/api/products")
@Validated
public class ProductController {
    private final CatalogService catalog;

    public ProductController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) @Positive Long categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @Size(max = 200) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return catalog.listProducts(categoryId, active, q, page, size);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable @Positive Long id) {
        return catalog.getProduct(id);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = catalog.createProduct(request);
        return ResponseEntity.created(URI.create("/api/products/" + product.id())).body(product);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable @Positive Long id, @Valid @RequestBody ProductRequest request) {
        return catalog.updateProduct(id, request);
    }

    @PatchMapping("/{id}/active")
    public ProductResponse setActive(@PathVariable @Positive Long id, @Valid @RequestBody ActiveRequest request) {
        return catalog.setProductActive(id, request.isActive());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
        catalog.setProductActive(id, false);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<VariantResponse> createVariant(@PathVariable @Positive Long productId,
                                                        @Valid @RequestBody VariantRequest request) {
        VariantResponse variant = catalog.createVariant(productId, request);
        return ResponseEntity.created(URI.create("/api/variants/" + variant.id())).body(variant);
    }
}
