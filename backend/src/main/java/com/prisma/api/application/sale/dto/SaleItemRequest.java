package com.prisma.api.application.sale.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaleItemRequest(
        @NotNull(message = "La variante del producto es obligatoria")
        Long variantId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser un entero positivo")
        @Max(value = 9999, message = "La cantidad máxima por línea es 9999")
        Integer quantity
) {
}
