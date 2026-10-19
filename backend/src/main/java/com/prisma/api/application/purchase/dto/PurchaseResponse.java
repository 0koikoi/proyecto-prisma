package com.prisma.api.application.purchase.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PurchaseResponse(
        Long id,
        Long supplierId,
        String supplierName,
        Long createdById,
        String createdByName,
        UUID requestKey,
        String invoiceNumber,
        String status,
        Instant purchasedAt,
        Instant receivedAt,
        String notes,
        BigDecimal totalAmount,
        List<PurchaseDetailResponse> details
) {}
