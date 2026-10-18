package com.prisma.api.application.cash;

import java.math.BigDecimal;

/** Cobros netos del turno por método de pago. */
record CashTotals(BigDecimal cash, BigDecimal yape, BigDecimal plin, BigDecimal card) {

    static final CashTotals ZERO = new CashTotals(
            BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(2),
            BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(2));
}
