package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.Order;
import com.prisma.api.domain.enums.ShippingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para la entidad Pedido (Order).
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Busca un pedido por su codigo unico comercial (ej. PED-2026-00001)
    Optional<Order> findByOrderCode(String orderCode);

    // Busca un pedido por su clave de idempotencia
    Optional<Order> findByRequestKey(UUID requestKey);

    // Listado paginado de pedidos ordenados por fecha descendente
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Listado paginado filtrado por estado de envio
    Page<Order> findByShippingStatusOrderByCreatedAtDesc(ShippingStatus status, Pageable pageable);

    // Cuenta pedidos en el anio actual para generar el correlativo
    long count();
}
