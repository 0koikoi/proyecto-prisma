package com.prisma.api.application.purchase.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreatePurchaseRequest(
        @NotNull(message = "El proveedor es obligatorio")
        Long supplierId,

        Long productId,

        Long variantId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser mayor a 0")
        Integer quantity,

        @NotNull(message = "El costo unitario es obligatorio")
        @DecimalMin(value = "0.0", message = "El costo unitario no puede ser negativo")
        BigDecimal costPrice,

        String invoiceNumber,

        String paymentMethod,

        String notes
) {}
