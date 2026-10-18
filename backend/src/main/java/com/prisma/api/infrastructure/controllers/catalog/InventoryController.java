package com.prisma.api.infrastructure.controllers.catalog;

import com.prisma.api.application.dto.catalog.CatalogDtos.*;
import com.prisma.api.application.services.InventoryService;
import com.prisma.api.domain.enums.InventoryMovementType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/inventory")
@Validated
public class InventoryController {
    private final InventoryService inventory;

    public InventoryController(InventoryService inventory) {
        this.inventory = inventory;
    }

    @GetMapping("/movements")
    public PageResponse<MovementResponse> listMovements(
            @RequestParam(required = false) @Positive Long variantId,
            @RequestParam(required = false) InventoryMovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return inventory.listMovements(variantId, type, from, to, page, size);
    }

    @GetMapping("/movements/{id}")
    public MovementResponse getMovement(@PathVariable @Positive Long id) {
        return inventory.getMovement(id);
    }

    @PostMapping("/movements/{id}/reversal")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse reverseAdjustment(@PathVariable @Positive Long id,
                                               @Valid @RequestBody ReversalRequest request) {
        return inventory.reverseAdjustment(id, request);
    }
}
