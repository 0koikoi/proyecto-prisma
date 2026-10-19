package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>, JpaSpecificationExecutor<ProductVariant> {
    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);
    boolean existsByBarcodeAndIdNot(String barcode, Long id);
    boolean existsByProductIdAndSizeLabelIgnoreCaseAndColorLabelIgnoreCaseAndIdNot(
            Long productId, String sizeLabel, String colorLabel, Long id);
    Optional<ProductVariant> findByBarcode(String barcode);

    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE v.id = :id AND v.isActive = true")
    Optional<ProductVariant> findByIdActiveWithProduct(@Param("id") Long id);

    Optional<ProductVariant> findBySku(String sku);

    @Query("select v.product.id from ProductVariant v where v.id = :id")
    Optional<Long> findProductIdById(@Param("id") Long id);

    // Use CatalogLocks in write services: category -> product -> variant.
    // Reservation writers must participate in the same locking protocol.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id = :id")
    Optional<ProductVariant> findLockedById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.product.id = :productId order by v.id")
    List<ProductVariant> findLockedByProductId(@Param("productId") Long productId);

    interface Availability {
        Long getVariantId();
        Long getReservedStock();
        Long getAvailableStock();
    }

    @Query(value = """
            select variant_id as "variantId", reserved_stock as "reservedStock",
                   available_stock as "availableStock"
              from v_inventory_availability where variant_id in (:ids)
            """, nativeQuery = true)
    List<Availability> findAvailability(@Param("ids") Collection<Long> ids);

    @Query("""
            select count(r) from InventoryReservation r join r.orderDetail d
            where d.variant.id = :variantId
              and r.status = com.prisma.api.domain.enums.ReservationStatus.ACTIVE
            """)
    long countActiveReservations(@Param("variantId") Long variantId);

    @Query("""
            select count(r) from InventoryReservation r join r.orderDetail d
            where d.variant.product.id = :productId
              and r.status = com.prisma.api.domain.enums.ReservationStatus.ACTIVE
            """)
    long countActiveProductReservations(@Param("productId") Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id in :ids order by v.id")
    List<ProductVariant> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);

    @Query("select v from ProductVariant v join fetch v.product p join fetch p.category "
            + "where v.isActive = true and p.isActive = true order by p.name, v.id")
    List<ProductVariant> findSellableCatalog();

    @Query("select v from ProductVariant v join fetch v.product p join fetch p.category "
            + "where v.barcode = :barcode and v.isActive = true and p.isActive = true")
    Optional<ProductVariant> findSellableByBarcode(@Param("barcode") String barcode);

    @Query(value = """
            select variant_id as "variantId", reserved_stock as "reservedStock",
                   available_stock as "availableStock"
              from v_inventory_availability
            """, nativeQuery = true)
    List<Availability> findAllAvailability();
}
