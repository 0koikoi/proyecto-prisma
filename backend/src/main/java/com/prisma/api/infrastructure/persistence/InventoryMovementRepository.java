package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio Spring Data JPA para el kardex de movimientos de inventario.
 */
@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    // Verifica si una linea de pedido ya genero un movimiento de salida (despacho)
    boolean existsByOrderDetailId(Long orderDetailId);

    // Busca movimiento de salida por linea de detalle de pedido
    Optional<InventoryMovement> findByOrderDetailId(Long orderDetailId);
}
