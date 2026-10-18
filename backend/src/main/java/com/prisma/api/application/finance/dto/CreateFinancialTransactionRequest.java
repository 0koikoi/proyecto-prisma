package com.prisma.api.application.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateFinancialTransactionRequest(
        @NotBlank(message = "El tipo de transacción es obligatorio (IN/OUT)")
        String transactionType,

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
        BigDecimal amount,

        @NotBlank(message = "El método de pago es obligatorio")
        String paymentMethod,

        Long cashRegisterId,

        String externalReference,

        String description
) {}
