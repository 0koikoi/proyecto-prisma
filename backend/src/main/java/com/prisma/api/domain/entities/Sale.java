package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Entidad Sale — representa una venta realizada en el mostrador (POS físico).
 * Es diferente a Order (que es una venta online/WhatsApp con envío).
 *
 * RELACIONES:
 *  - @ManyToOne CashRegister — la caja activa al momento de la venta
 *  - @OneToMany SaleDetail — los productos vendidos (FK: sale_id)
 *
 * FLUJO TRANSACCIONAL (a implementar en SaleUseCase):
 *  1. Validar que cada producto tenga stock suficiente.
 *  2. Crear el Sale y sus SaleDetails.
 *  3. Descontar stock de cada Product.
 *  4. Sumar el monto al campo correcto de CashRegister (según paymentMethod).
 *  5. Registrar un FinancialTransaction de tipo INGRESO / VENTA_POS.
 *  Todo debe ser @Transactional — si falla algo, se revierte completo.
 *
 * TODO Leo: Completar los campos indicados abajo.
 */
@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Leo: String ticketNumber — NOT NULL, UNIQUE. Ej: "TK-001234"
    // TODO Leo: String customerName — nullable, default "Cliente Mostrador"
    // TODO Leo: BigDecimal subtotal — NOT NULL
    // TODO Leo: BigDecimal discount — default 0.00
    // TODO Leo: BigDecimal total — NOT NULL
    // TODO Leo: String paymentMethod — enum: EFECTIVO | YAPE | PLIN | TARJETA
    // TODO Leo: BigDecimal cashGiven — nullable (solo para EFECTIVO)
    // TODO Leo: BigDecimal cashChange — nullable (vuelto, solo EFECTIVO)
    // TODO Leo: LocalDateTime createdAt — NOT NULL, default now()

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "cash_register_id")
    // TODO Leo: private CashRegister cashRegister;

    // @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    // TODO Leo: private List<SaleDetail> details;

    // TODO Leo: generar getters y setters
}
