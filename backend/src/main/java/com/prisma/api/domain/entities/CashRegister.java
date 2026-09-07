package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Entidad CashRegister — representa la apertura y cierre de un turno de caja.
 * Una sola caja puede estar OPEN a la vez. Cada Sale se asocia a la caja activa.
 *
 * LÓGICA DE NEGOCIO:
 *  - Al abrir: se registra initialCash (el sencillo que hay en la gaveta).
 *  - Durante el turno: cada Sale suma a la caja según su paymentMethod.
 *  - Al cerrar: se ingresa countedCash (conteo físico real).
 *    El sistema calcula: expectedCash = initialCash + totalCashSales
 *    La diferencia = countedCash - expectedCash (positivo=sobrante, negativo=faltante).
 *
 * TODO Leo: Completar los campos indicados abajo.
 * TODO Leo: Agregar relación @OneToMany con List<Sale>.
 */
@Entity
@Table(name = "cash_registers")
public class CashRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Leo: String openedBy — NOT NULL. Nombre del vendedor que abre caja
    // TODO Leo: LocalDateTime openedAt — NOT NULL, default now()
    // TODO Leo: LocalDateTime closedAt — nullable (null mientras está abierta)
    // TODO Leo: BigDecimal initialCash — NOT NULL. Sencillo inicial
    // TODO Leo: BigDecimal totalCashSales — BigDecimal, default 0. Suma de ventas en efectivo
    // TODO Leo: BigDecimal totalYapeSales — default 0
    // TODO Leo: BigDecimal totalPlinSales — default 0
    // TODO Leo: BigDecimal totalCardSales — default 0
    // TODO Leo: BigDecimal expectedCash — calculado al cierre (initialCash + totalCashSales)
    // TODO Leo: BigDecimal countedCash — ingresado manualmente al cerrar
    // TODO Leo: BigDecimal cashDifference — = countedCash - expectedCash
    // TODO Leo: String status — enum: "OPEN" | "CLOSED". Default "OPEN"
    // TODO Leo: String notes — nullable. Observaciones del cierre

    // TODO Leo: generar getters y setters
}
