package com.prisma.api.application.cash.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Estado del turno de caja. Los totales por método son netos (cobros menos reintegros)
 * y {@code expectedCash} es saldo inicial + efectivo neto; Yape, Plin y tarjeta no suman al efectivo físico.
 */
public record CashRegisterStatusResponse(
        boolean open,
        Long registerId,
        String openedBy,
        Instant openedAt,
        BigDecimal initialCash,
        BigDecimal totalCashSales,
        BigDecimal totalYapeSales,
        BigDecimal totalPlinSales,
        BigDecimal totalCardSales,
        BigDecimal expectedCash
) {
}
