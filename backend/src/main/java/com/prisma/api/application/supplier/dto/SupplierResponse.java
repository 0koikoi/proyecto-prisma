package com.prisma.api.application.supplier.dto;

import com.prisma.api.domain.entities.Supplier;

import java.time.Instant;

/**
 * Datos que la API retorna sobre un proveedor.
 */
public record SupplierResponse(
        Long id,
        String companyName,
        String contactName,
        String phone,
        String email,
        String address,
        String taxIdType,
        String taxId,
        String notes,
        boolean isActive,
        Instant createdAt
) {
    // Convierte una entidad Supplier en su representacion de respuesta DTO
    public static SupplierResponse fromEntity(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getCompanyName(),
                supplier.getContactName(),
                supplier.getPhone(),
                supplier.getEmail(),
                supplier.getAddress(),
                supplier.getTaxIdType(),
                supplier.getTaxId(),
                supplier.getNotes(),
                supplier.isActive(),
                supplier.getCreatedAt()
        );
    }
}
