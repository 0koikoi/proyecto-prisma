package com.prisma.api.application.dto.catalog;

import com.prisma.api.domain.enums.InventoryMovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class CatalogDtos {
    private CatalogDtos() {
    }

    public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {
    }

    public record CategoryRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 5000) String description) {
    }

    public record CategoryResponse(Long id, String name, String description, boolean isActive, Instant createdAt) {
    }

    public record ProductRequest(
            @NotNull @Positive Long categoryId,
            @NotBlank @Size(max = 150) String name,
            @Size(max = 10000) String description,
            @Size(max = 2048) @URL
            @Pattern(regexp = "(?i)^https?://[^\\s]+$", message = "debe ser una URL HTTP o HTTPS")
            String imageUrl) {
    }

    public record ProductResponse(Long id, Long categoryId, String categoryName, String name,
                                  String description, String imageUrl, boolean isActive,
                                  Instant createdAt, Instant updatedAt) {
    }

    public record VariantRequest(
            @NotBlank @Size(max = 50) String sku,
            @Size(max = 50) String barcode,
            @NotBlank @Size(max = 30) String sizeLabel,
            @NotBlank @Size(max = 50) String colorLabel,
            @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 4) BigDecimal costPrice,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 10, fraction = 2) BigDecimal salePrice,
            @NotNull @PositiveOrZero Integer minStockAlert) {
    }

    public record VariantUpdateRequest(
            @NotBlank @Size(max = 50) String sku,
            @Size(max = 50) String barcode,
            @NotBlank @Size(max = 30) String sizeLabel,
            @NotBlank @Size(max = 50) String colorLabel,
            @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 4) BigDecimal costPrice,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 10, fraction = 2) BigDecimal salePrice,
            @NotNull @PositiveOrZero Integer minStockAlert,
            @NotNull @PositiveOrZero Long version) {
    }

    public record VariantResponse(Long id, Long productId, String productName, Long categoryId,
                                  String categoryName, String sku, String barcode, String sizeLabel,
                                  String colorLabel, BigDecimal costPrice, BigDecimal salePrice,
                                  int currentStock, long reservedStock, long availableStock,
                                  int minStockAlert, boolean lowStock, boolean isActive, long version) {
    }

    public record ActiveRequest(@NotNull Boolean isActive) {
    }

    public record AdjustmentRequest(@NotNull UUID requestKey, @NotNull Integer quantity,
                                    @NotBlank @Size(max = 1000) String reason) {
    }

    public record ReversalRequest(@NotNull UUID requestKey, @NotBlank @Size(max = 1000) String reason) {
    }

    public record MovementResponse(Long id, Long variantId, String sku, InventoryMovementType movementType,
                                   int quantity, String reason, UUID requestKey, Long createdBy,
                                   String createdByName, Instant createdAt, Long saleDetailId,
                                   Long orderDetailId, Long purchaseDetailId, Long saleReturnDetailId,
                                   Long reversalOfId) {
    }
}
