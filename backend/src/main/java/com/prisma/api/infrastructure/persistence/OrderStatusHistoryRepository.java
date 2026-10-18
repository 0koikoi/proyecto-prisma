package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio Spring Data JPA para el historial de cambios de estado de un Pedido.
 */
@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    // Lista la cronologia de estados de un pedido con el usuario que lo autorizo
    @Query("SELECT h FROM OrderStatusHistory h " +
           "JOIN FETCH h.changedBy " +
           "WHERE h.order.id = :orderId " +
           "ORDER BY h.changedAt ASC, h.id ASC")
    List<OrderStatusHistory> findByOrderIdOrderByChangedAtAsc(@Param("orderId") Long orderId);
}
