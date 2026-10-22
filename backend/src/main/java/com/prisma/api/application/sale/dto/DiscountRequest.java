package com.prisma.api.application.sale.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DiscountRequest(
        @NotNull(message = "El tipo de descuento es obligatorio")
        DiscountType type,

        @NotNull(message = "El valor del descuento es obligatorio")
        @DecimalMin(value = "0.01", message = "El descuento debe ser mayor a cero")
        @Digits(integer = 10, fraction = 2, message = "El descuento admite hasta 2 decimales")
        BigDecimal value
) {
}
