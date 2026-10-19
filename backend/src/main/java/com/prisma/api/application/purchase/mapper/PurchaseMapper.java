package com.prisma.api.application.purchase.mapper;

import com.prisma.api.application.purchase.dto.PurchaseDetailResponse;
import com.prisma.api.application.purchase.dto.PurchaseResponse;
import com.prisma.api.domain.entities.Purchase;
import com.prisma.api.domain.entities.PurchaseDetail;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

public final class PurchaseMapper {

    private PurchaseMapper() {}

    public static PurchaseDetailResponse toDetailResponse(PurchaseDetail detail) {
        if (detail == null) return null;
        BigDecimal subtotal = detail.getUnitCost()
                .multiply(BigDecimal.valueOf(detail.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        String productName = detail.getVariant() != null && detail.getVariant().getProduct() != null
                ? detail.getVariant().getProduct().getName()
                : "Producto #" + (detail.getVariant() != null ? detail.getVariant().getId() : "N/A");

        String sku = detail.getVariant() != null ? detail.getVariant().getSku() : "";

        return new PurchaseDetailResponse(
                detail.getId(),
                detail.getVariant() != null ? detail.getVariant().getId() : null,
                productName,
                sku,
                detail.getQuantity(),
                detail.getUnitCost().setScale(2, RoundingMode.HALF_UP),
                subtotal
        );
    }

    public static PurchaseResponse toResponse(Purchase purchase, List<PurchaseDetail> details) {
        if (purchase == null) return null;

        List<PurchaseDetailResponse> detailResponses = details != null
                ? details.stream().map(PurchaseMapper::toDetailResponse).toList()
                : Collections.emptyList();

        BigDecimal totalAmount = detailResponses.stream()
                .map(PurchaseDetailResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PurchaseResponse(
                purchase.getId(),
                purchase.getSupplier() != null ? purchase.getSupplier().getId() : null,
                purchase.getSupplier() != null ? purchase.getSupplier().getCompanyName() : "",
                purchase.getCreatedBy() != null ? purchase.getCreatedBy().getId() : null,
                purchase.getCreatedBy() != null ? purchase.getCreatedBy().getFullName() : "",
                purchase.getRequestKey(),
                purchase.getInvoiceNumber(),
                purchase.getStatus() != null ? purchase.getStatus().name() : null,
                purchase.getPurchasedAt(),
                purchase.getReceivedAt(),
                purchase.getNotes(),
                totalAmount,
                detailResponses
        );
    }
}
