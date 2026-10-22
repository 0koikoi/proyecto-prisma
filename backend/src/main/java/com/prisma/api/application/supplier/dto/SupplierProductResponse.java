package com.prisma.api.application.supplier.dto;

import com.prisma.api.domain.entities.Product;

/**
 * Datos resumidos de un producto abastecido por un proveedor.
 */
public record SupplierProductResponse(
        Long productId,
        String productName,
        String categoryName,
        String imageUrl,
        boolean isActive
) {
    // Mapea un producto a su representacion resumida para proveedores
    public static SupplierProductResponse fromProduct(Product product) {
        return new SupplierProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getImageUrl(),
                product.isActive()
        );
    }
}
