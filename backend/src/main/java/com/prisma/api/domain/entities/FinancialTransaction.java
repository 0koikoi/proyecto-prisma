package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Meli
 * MÓDULO: Reporte Financiero
 *
 * Entidad FinancialTransaction — libro mayor que consolida TODOS los movimientos
 * de dinero del negocio en un único lugar, para que Meli pueda construir el
 * reporte financiero sin necesidad de consultar múltiples tablas.
 *
 * Esta tabla es alimentada automáticamente por los UseCases de otros módulos:
 *  - Leo (Sale): crea una transacción INGRESO/VENTA_POS al confirmar cada venta.
 *  - Zully (Order): crea INGRESO/VENTA_ONLINE al confirmar un pedido pagado.
 *  - Zully (Purchase): crea EGRESO/COMPRA_MERCADERIA al registrar una reposición.
 *
 * TIPOS:
 *  - transactionType: INGRESO | EGRESO
 *  - category: VENTA_POS | VENTA_ONLINE | COMPRA_MERCADERIA | GASTO_LOGISTICA | GASTO_OPERATIVO
 *
 * TODO Meli: Completar los campos indicados abajo.
 * TODO Meli: Los endpoints GET /finance/summary y GET /finance/transactions
 *            serán responsabilidad de Meli (DashboardController o FinancialController).
 * TODO Meli: Coordinar con Leo y Zully para que sus UseCases creen la transacción financiera.
 */
@Entity
@Table(name = "financial_transactions")
public class FinancialTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Meli: String transactionType — enum: INGRESO | EGRESO
    // TODO Meli: String category — enum: VENTA_POS | VENTA_ONLINE | COMPRA_MERCADERIA | GASTO_LOGISTICA | GASTO_OPERATIVO
    // TODO Meli: BigDecimal amount — NOT NULL
    // TODO Meli: String paymentMethod — ej: EFECTIVO | YAPE | PLIN | TARJETA | TRANSFERENCIA
    // TODO Meli: String referenceId — nullable. Ej: "TK-001234", "ORD-0001"
    // TODO Meli: String description — nullable. Descripción legible del movimiento
    // TODO Meli: LocalDateTime createdAt — default now()

    // TODO Meli: generar getters y setters
}
