package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Repositorio de Sale (ventas presenciales).
 *
 * TODO Leo: Descomentar y completar los métodos según la entidad Sale esté lista. Sugeridos:
 *
 *   - Optional<Sale> findByTicketNumber(String ticketNumber)
 *     → Para buscar una venta por su número de ticket
 *
 *   - List<Sale> findByCashRegisterId(Long cashRegisterId)
 *     → Para listar todas las ventas de la caja activa
 *
 *   - List<Sale> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to)
 *     → Para los reportes de ventas por rango de fechas (Dashboard / Keila y Meli)
 */
public interface SaleRepository extends JpaRepository<Sale, Long> {
    // TODO Leo: descomentar los métodos según se vayan necesitando
}
