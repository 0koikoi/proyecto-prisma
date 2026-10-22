package com.prisma.api.application.cash;

import com.prisma.api.application.cash.dto.CashRegisterStatusResponse;
import com.prisma.api.domain.entities.CashRegister;

import java.math.BigDecimal;
import java.math.RoundingMode;

final class CashRegisterMapper {

    private CashRegisterMapper() {
    }

    static CashRegisterStatusResponse toStatus(CashRegister register, CashTotals totals) {
        BigDecimal initial = register.getInitialCash().setScale(2, RoundingMode.HALF_UP);
        return new CashRegisterStatusResponse(
                true,
                register.getId(),
                register.getOpenedBy().getFullName(),
                register.getOpenedAt(),
                initial,
                totals.cash(),
                totals.yape(),
                totals.plin(),
                totals.card(),
                initial.add(totals.cash()));
    }

    static CashRegisterStatusResponse closedStatus() {
        BigDecimal zero = BigDecimal.ZERO.setScale(2);
        return new CashRegisterStatusResponse(false, null, null, null, zero, zero, zero, zero, zero, zero);
    }
}
