package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos
 *
 * Entidad OrderDetail — cada producto incluido en un pedido online.
 * Similar a SaleDetail, guarda el snapshot de costPrice para que los
 * cálculos de rentabilidad de Meli sean correctos históricamente.
 *
 * TODO Zully: Completar los campos indicados abajo.
 */
@Entity
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "order_id", nullable = false)
    // TODO Zully: private Order order;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "product_id", nullable = false)
    // TODO Zully: private Product product;

    // TODO Zully: Integer quantity — NOT NULL, CHECK > 0
    // TODO Zully: BigDecimal unitPrice — NOT NULL. Snapshot del precio de venta
    // TODO Zully: BigDecimal unitCost — NOT NULL. Snapshot del costo de compra
    // TODO Zully: BigDecimal subtotal — NOT NULL. = quantity * unitPrice

    // TODO Zully: generar getters y setters
}
