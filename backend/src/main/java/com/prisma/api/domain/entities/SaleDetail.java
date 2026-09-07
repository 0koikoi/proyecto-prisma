package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Entidad SaleDetail — cada línea de producto dentro de una venta.
 * Guarda un snapshot de unitCost al momento de la venta para que los reportes
 * de rentabilidad de Meli sean exactos aunque el costo del producto cambie después.
 *
 * TODO Leo: Completar los campos indicados abajo.
 */
@Entity
@Table(name = "sale_details")
public class SaleDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "sale_id", nullable = false)
    // TODO Leo: private Sale sale;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "product_id", nullable = false)
    // TODO Leo: private Product product;

    // TODO Leo: Integer quantity — NOT NULL, CHECK > 0
    // TODO Leo: BigDecimal unitPrice — NOT NULL. Precio de venta al momento de la venta
    // TODO Leo: BigDecimal unitCost — NOT NULL. Costo de compra al momento de la venta (snapshot)
    // TODO Leo: BigDecimal subtotal — NOT NULL. = quantity * unitPrice

    // TODO Leo: generar getters y setters
}
