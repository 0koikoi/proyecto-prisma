package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio Spring Data JPA para la entidad Proveedor.
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    // Lista solo los proveedores activos ordenados por razon social
    List<Supplier> findByIsActiveTrueOrderByCompanyNameAsc();

    // Busca un proveedor activo por su identificador
    Optional<Supplier> findByIdAndIsActiveTrue(Long id);

    // Verifica si ya existe otro proveedor con el mismo par tipo y numero de documento
    boolean existsByTaxIdTypeAndTaxId(String taxIdType, String taxId);

    // Verifica unicidad de documento excluyendo un ID especifico (para actualizaciones)
    boolean existsByTaxIdTypeAndTaxIdAndIdNot(String taxIdType, String taxId, Long id);
}
