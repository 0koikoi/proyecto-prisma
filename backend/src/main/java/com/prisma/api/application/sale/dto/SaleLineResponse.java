package com.prisma.api.application.sale.dto;

import java.math.BigDecimal;

public record SaleLineResponse(
        Long variantId,
        String sku,
        String name,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}
