package com.prisma.api.application.finance.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record FinancialTransactionResponse(
        Long id,
        Instant date,
        String type,
        String channel,
        String category,
        String method,
        BigDecimal amount,
        String desc
) {}
