package com.prisma.api.application.sale.mapper;

import com.prisma.api.application.sale.dto.PosCatalogItemResponse;
import com.prisma.api.domain.entities.ProductVariant;

public final class PosCatalogMapper {

    private PosCatalogMapper() {
    }

    public static PosCatalogItemResponse toResponse(ProductVariant variant, long availableStock) {
        return new PosCatalogItemResponse(
                variant.getId(),
                variant.getSku(),
                variant.getBarcode(),
                VariantLabel.of(variant),
                variant.getProduct().getCategory().getName(),
                variant.getSalePrice(),
                (int) Math.max(availableStock, 0),
                variant.getMinStockAlert(),
                variant.getProduct().getImageUrl());
    }
}
