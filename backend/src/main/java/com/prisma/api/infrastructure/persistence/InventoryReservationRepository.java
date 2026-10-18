package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.InventoryReservation;
import com.prisma.api.domain.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio Spring Data JPA para las reservas de inventario por pedido.
 */
@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    // Lista las reservas asociadas a las lineas de un pedido especifico
    @Query("SELECT r FROM InventoryReservation r " +
           "JOIN FETCH r.orderDetail od " +
           "WHERE od.order.id = :orderId")
    List<InventoryReservation> findByOrderId(@Param("orderId") Long orderId);

    // Suma la cantidad total de unidades reservadas activas para una variante
    @Query("SELECT COALESCE(SUM(od.quantity), 0) FROM InventoryReservation r " +
           "JOIN r.orderDetail od " +
           "WHERE od.variant.id = :variantId AND r.status = :status")
    int sumReservedQuantityByVariantIdAndStatus(
            @Param("variantId") Long variantId,
            @Param("status") ReservationStatus status
    );

    // Busca reserva por el ID de la linea de detalle del pedido
    Optional<InventoryReservation> findByOrderDetailId(Long orderDetailId);
}
