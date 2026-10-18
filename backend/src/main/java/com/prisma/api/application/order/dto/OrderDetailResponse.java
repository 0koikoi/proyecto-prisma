package com.prisma.api.application.order.dto;

import com.prisma.api.domain.entities.OrderDetail;
import com.prisma.api.domain.entities.ProductVariant;

import java.math.BigDecimal;

/**
 * Linea de producto en el detalle del pedido.
 */
public record OrderDetailResponse(
        Long id,
        Long variantId,
        String sku,
        String productName,
        String sizeLabel,
        String colorLabel,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
    // Mapea la entidad OrderDetail a su DTO de salida
    public static OrderDetailResponse fromEntity(OrderDetail detail) {
        ProductVariant v = detail.getVariant();
        BigDecimal subtotal = detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity()));

        return new OrderDetailResponse(
                detail.getId(),
                v.getId(),
                v.getSku(),
                v.getProduct() != null ? v.getProduct().getName() : null,
                v.getSizeLabel(),
                v.getColorLabel(),
                detail.getQuantity(),
                detail.getUnitPrice(),
                subtotal
        );
    }
}
