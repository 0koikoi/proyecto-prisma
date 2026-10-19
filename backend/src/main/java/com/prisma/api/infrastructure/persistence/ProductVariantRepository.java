package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /** Stock vendible de una variante: existencias menos reservas activas de pedidos. */
    interface Availability {
        Long getVariantId();

        Long getAvailableStock();
    }

    /**
     * Bloquea las variantes en orden ascendente de id: ventas simultáneas con productos
     * en común toman los bloqueos en el mismo orden y no se bloquean entre sí en círculo.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id in :ids order by v.id")
    List<ProductVariant> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);

    @Query("select v from ProductVariant v join fetch v.product p join fetch p.category "
            + "where v.isActive = true and p.isActive = true order by p.name, v.id")
    List<ProductVariant> findSellableCatalog();

    @Query("select v from ProductVariant v join fetch v.product p join fetch p.category "
            + "where v.barcode = :barcode and v.isActive = true and p.isActive = true")
    Optional<ProductVariant> findSellableByBarcode(@Param("barcode") String barcode);

    @Query(value = "select variant_id as \"variantId\", available_stock as \"availableStock\" "
            + "from v_inventory_availability where variant_id in (:ids)", nativeQuery = true)
    List<Availability> findAvailability(@Param("ids") Collection<Long> ids);

    @Query(value = "select variant_id as \"variantId\", available_stock as \"availableStock\" "
            + "from v_inventory_availability", nativeQuery = true)
    List<Availability> findAllAvailability();
}
