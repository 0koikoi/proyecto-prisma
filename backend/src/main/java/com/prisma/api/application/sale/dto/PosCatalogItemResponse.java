package com.prisma.api.application.sale.dto;

import java.math.BigDecimal;

/** Variante vendible en el POS; {@code id} es el id de la variante y {@code stock} excluye lo reservado por pedidos. */
public record PosCatalogItemResponse(
        Long id,
        String sku,
        String barcode,
        String name,
        String category,
        BigDecimal price,
        Integer stock,
        Integer minStockAlert,
        String imageUrl
) {
}
