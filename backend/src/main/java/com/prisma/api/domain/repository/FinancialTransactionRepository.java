package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * RESPONSABLE: Meli
 * MÓDULO: Reporte Financiero
 *
 * Repositorio de FinancialTransaction.
 *
 * TODO Meli: Descomentar y completar los métodos. Sugeridos:
 *
 *   - List<FinancialTransaction> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to)
 *     → Para el reporte por rango de fechas (semana, mes, año)
 *
 *   - List<FinancialTransaction> findByTransactionType(String type)
 *     → Para separar INGRESOS de EGRESOS en el balance
 *
 *   - List<FinancialTransaction> findByCategory(String category)
 *     → Para desglosar por canal: VENTA_POS vs VENTA_ONLINE vs COMPRA_MERCADERIA
 *
 * NOTA para Meli: Los endpoints del reporte financiero irán en su propio controller.
 * Coordina con Leo y Zully para que sus UseCases registren aquí cada transacción.
 */
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    // TODO Meli: descomentar los métodos según se vayan necesitando
}
