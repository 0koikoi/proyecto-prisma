package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Kardex / Auditoría de Movimientos
 *
 * Entidad InventoryMovement — registra cada cambio en el stock de un producto.
 * Es una tabla de auditoría que explica el "por qué" del stock actual.
 * NO modificar el stock directamente en Product; siempre pasar por esta entidad.
 *
 * TIPOS DE MOVIMIENTO:
 *  - ENTRADA_COMPRA    → Reposición desde proveedor (reference_id = purchase.id)
 *  - SALIDA_VENTA_POS  → Venta en mostrador (reference_id = sale.ticketNumber)
 *  - SALIDA_PEDIDO     → Pedido online despachado (reference_id = order.orderCode)
 *  - AJUSTE_MANUAL     → Corrección de inventario por conteo físico
 *
 * IMPORTANTE: quantity debe ser POSITIVO para entradas, NEGATIVO para salidas.
 *
 * TODO Mauricio: Completar los campos indicados abajo.
 * TODO Mauricio: Este registro lo crea el UseCase de Venta (Leo), de Pedido (Zully)
 *                y de Compra (Zully). Coordinar la interfaz compartida con el equipo.
 */
@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "product_id", nullable = false)
    // TODO Mauricio: private Product product;

    // TODO Mauricio: String movementType — enum: ENTRADA_COMPRA | SALIDA_VENTA_POS | SALIDA_PEDIDO | AJUSTE_MANUAL
    // TODO Mauricio: Integer quantity — NOT NULL. Positivo=entrada, negativo=salida
    // TODO Mauricio: Integer previousStock — NOT NULL. Stock antes del movimiento
    // TODO Mauricio: Integer newStock — NOT NULL. Stock resultante
    // TODO Mauricio: String referenceId — nullable. ID del Sale, Order o Purchase relacionado
    // TODO Mauricio: LocalDateTime createdAt — default now()

    // TODO Mauricio: generar getters y setters
}
