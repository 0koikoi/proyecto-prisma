package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores
 *
 * Repositorio de Supplier.
 *
 * TODO Zully: Descomentar y completar los métodos si se requieren búsquedas adicionales.
 *   Sugerido: Optional<Supplier> findByTaxId(String taxId)
 *     → Para buscar un proveedor por RUC/DNI y evitar duplicados.
 */
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    // TODO Zully: agregar métodos de búsqueda si se requieren
}
