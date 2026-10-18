package com.prisma.api.application.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Item individual solicitado en un pedido.
 */
public record OrderItemRequest(
        @NotNull(message = "El identificador de la variante de producto es obligatorio")
        Long variantId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima por producto es 1")
        Integer quantity
) {}
