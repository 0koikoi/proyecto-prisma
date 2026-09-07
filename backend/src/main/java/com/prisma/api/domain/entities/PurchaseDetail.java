package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores — Historial de Reposiciones
 *
 * Entidad PurchaseDetail — cada producto incluido en una compra a proveedor.
 *
 * TODO Zully: Completar los campos indicados abajo.
 */
@Entity
@Table(name = "purchase_details")
public class PurchaseDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "purchase_id", nullable = false)
    // TODO Zully: private Purchase purchase;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "product_id", nullable = false)
    // TODO Zully: private Product product;

    // TODO Zully: Integer quantity — NOT NULL, CHECK > 0
    // TODO Zully: BigDecimal unitCost — NOT NULL. Precio pagado al proveedor por unidad
    // TODO Zully: BigDecimal subtotal — NOT NULL. = quantity * unitCost

    // TODO Zully: generar getters y setters
}
