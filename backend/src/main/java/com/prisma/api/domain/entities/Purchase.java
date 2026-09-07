package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores — Historial de Reposiciones
 *
 * Entidad Purchase — registra cada compra de mercadería a un proveedor.
 * Al confirmar una compra, el UseCase de Inventario (Mauricio) debe:
 *   1. Crear el Purchase y sus PurchaseDetails.
 *   2. Incrementar el currentStock de cada Product.
 *   3. Registrar un InventoryMovement tipo "ENTRADA_COMPRA" por cada producto.
 *   4. Registrar un FinancialTransaction tipo EGRESO / COMPRA_MERCADERIA.
 *
 * TODO Zully: Completar los campos indicados abajo.
 * TODO Zully: Coordinar con Mauricio (Inventario) el endpoint que actualiza el stock.
 */
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Zully: String invoiceNumber — nullable. Número de factura o boleta del proveedor
    // TODO Zully: BigDecimal total — NOT NULL
    // TODO Zully: String paymentMethod — ej: EFECTIVO | TRANSFERENCIA | YAPE
    // TODO Zully: LocalDateTime purchasedAt — default now()
    // TODO Zully: String notes — nullable

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "supplier_id", nullable = false)
    // TODO Zully: private Supplier supplier;

    // @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    // TODO Zully: private List<PurchaseDetail> details;

    // TODO Zully: generar getters y setters
}
