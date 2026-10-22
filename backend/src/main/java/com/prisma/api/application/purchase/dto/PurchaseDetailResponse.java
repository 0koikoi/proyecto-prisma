package com.prisma.api.application.purchase.dto;

import java.math.BigDecimal;

public record PurchaseDetailResponse(
        Long id,
        Long variantId,
        String productName,
        String sku,
        Integer quantity,
        BigDecimal unitCost,
        BigDecimal subtotal
) {}
