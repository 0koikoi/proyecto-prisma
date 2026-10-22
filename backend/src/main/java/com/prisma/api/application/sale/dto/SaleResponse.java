package com.prisma.api.application.sale.dto;

import com.prisma.api.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** {@code cashGiven} es nulo en pagos digitales y {@code change} es el vuelto (0.00 si no hubo efectivo). */
public record SaleResponse(
        Long id,
        String ticketNumber,
        Instant createdAt,
        String customerName,
        List<SaleLineResponse> items,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal total,
        PaymentMethod paymentMethod,
        BigDecimal cashGiven,
        BigDecimal change
) {
}
