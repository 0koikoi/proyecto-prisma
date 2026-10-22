package com.prisma.api.application.sale.dto;

import com.prisma.api.domain.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Venta de mostrador. El servidor fija precios, costos, total, turno y responsable;
 * {@code requestKey} identifica el intento de cobro para que un reintento no duplique la venta.
 */
public record CreateSaleRequest(
        @NotNull(message = "La clave de la operación (requestKey) es obligatoria")
        UUID requestKey,

        @NotEmpty(message = "La venta debe incluir al menos un producto")
        @Valid
        List<SaleItemRequest> items,

        @Valid
        DiscountRequest discount,

        @NotNull(message = "El método de pago es obligatorio")
        PaymentMethod paymentMethod,

        @DecimalMin(value = "0.00", message = "El efectivo entregado no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El efectivo entregado admite hasta 2 decimales")
        BigDecimal cashGiven,

        @Size(max = 120, message = "El nombre del cliente admite hasta 120 caracteres")
        String customerName
) {
}
