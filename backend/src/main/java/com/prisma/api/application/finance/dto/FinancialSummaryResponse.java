package com.prisma.api.application.finance.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinancialSummaryResponse(
        PeriodDto period,
        BigDecimal totalPhysicalSales,
        BigDecimal totalOnlineSales,
        BigDecimal totalRevenue,
        BigDecimal totalCostOfGoodsSold,
        BigDecimal grossProfit,
        Double netMarginPercentage,
        List<FinancialTransactionResponse> transactions
) {}
