package com.prisma.api.application.cash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CloseCashRegisterRequest(
        @NotNull(message = "El efectivo contado es obligatorio")
        @DecimalMin(value = "0.00", message = "El efectivo contado no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El efectivo contado admite hasta 2 decimales")
        BigDecimal countedCash,

        @Size(max = 500, message = "Las notas admiten hasta 500 caracteres")
        String notes
) {
}
