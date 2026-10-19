package com.prisma.api.application.cash.dto;

import java.math.BigDecimal;
import java.time.Instant;

/** Resultado del cierre: {@code difference} = contado - esperado (positivo sobrante, negativo faltante). */
public record CloseCashRegisterResponse(
        Long registerId,
        BigDecimal expectedCash,
        BigDecimal countedCash,
        BigDecimal difference,
        Instant closedAt
) {
}
