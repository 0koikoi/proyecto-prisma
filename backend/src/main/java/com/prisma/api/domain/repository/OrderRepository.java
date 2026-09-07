package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos
 *
 * Repositorio de Order (pedidos online / WhatsApp).
 *
 * TODO Zully: Descomentar y completar los métodos. Sugeridos:
 *
 *   - List<Order> findByShippingStatus(String status)
 *     → Para filtrar pedidos por estado (PENDING, PREPARING, SHIPPED, DELIVERED)
 *
 *   - List<Order> findByChannel(String channel)
 *     → Para filtrar por canal de origen (WHATSAPP, MESSENGER, TIENDA_ONLINE)
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
    // TODO Zully: descomentar los métodos según se vayan necesitando
}
