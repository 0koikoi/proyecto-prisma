package com.prisma.api.infrastructure.controllers.catalog;

import com.prisma.api.application.dto.catalog.CatalogDtos.*;
import com.prisma.api.application.services.CatalogService;
import com.prisma.api.application.services.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/variants")
@Validated
public class VariantController {
    private final CatalogService catalog;
    private final InventoryService inventory;

    public VariantController(CatalogService catalog, InventoryService inventory) {
        this.catalog = catalog;
        this.inventory = inventory;
    }

    @GetMapping
    public PageResponse<VariantResponse> list(
            @RequestParam(required = false) @Positive Long productId,
            @RequestParam(required = false) @Positive Long categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) @Size(max = 200) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return catalog.listVariants(productId, categoryId, active, lowStock, q, page, size);
    }

    @GetMapping("/by-barcode")
    public VariantResponse findByBarcode(@RequestParam @NotBlank @Size(max = 50) String barcode) {
        return catalog.findByBarcode(barcode);
    }

    @GetMapping("/{id}")
    public VariantResponse get(@PathVariable @Positive Long id) {
        return catalog.getVariant(id);
    }

    @PutMapping("/{id}")
    public VariantResponse update(@PathVariable @Positive Long id,
                                  @Valid @RequestBody VariantUpdateRequest request) {
        return catalog.updateVariant(id, request);
    }

    @PatchMapping("/{id}/active")
    public VariantResponse setActive(@PathVariable @Positive Long id, @Valid @RequestBody ActiveRequest request) {
        return catalog.setVariantActive(id, request.isActive());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
        catalog.setVariantActive(id, false);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/adjustments")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse adjustStock(@PathVariable @Positive Long id,
                                        @Valid @RequestBody AdjustmentRequest request) {
        return inventory.adjustStock(id, request);
    }
}
