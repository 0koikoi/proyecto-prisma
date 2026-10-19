package com.prisma.api.application.cash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OpenCashRegisterRequest(
        @NotNull(message = "El sencillo inicial es obligatorio")
        @DecimalMin(value = "0.00", message = "El sencillo inicial no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El sencillo inicial admite hasta 2 decimales")
        BigDecimal initialCash
) {
}
