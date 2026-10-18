package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.SupplierProduct;
import com.prisma.api.domain.entities.SupplierProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio Spring Data JPA para la relacion N:M entre Proveedores y Productos.
 */
@Repository
public interface SupplierProductRepository extends JpaRepository<SupplierProduct, SupplierProductId> {

    // Lista las relaciones activas de un proveedor incluyendo datos basicos del producto
    @Query("SELECT sp FROM SupplierProduct sp JOIN FETCH sp.product p JOIN FETCH p.category " +
           "WHERE sp.id.supplierId = :supplierId AND sp.isActive = true AND p.isActive = true")
    List<SupplierProduct> findActiveBySupplierId(@Param("supplierId") Long supplierId);

    // Verifica si un producto ya esta vinculado activamente a un proveedor
    boolean existsByIdSupplierIdAndIdProductIdAndIsActiveTrue(Long supplierId, Long productId);
}
