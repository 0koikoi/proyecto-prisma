package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio Spring Data JPA para las lineas de detalle de un Pedido.
 */
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // Lista las lineas de un pedido con sus variantes y productos cargados
    @Query("SELECT d FROM OrderDetail d " +
           "JOIN FETCH d.variant v " +
           "JOIN FETCH v.product p " +
           "WHERE d.order.id = :orderId")
    List<OrderDetail> findByOrderIdWithVariant(@Param("orderId") Long orderId);
}
