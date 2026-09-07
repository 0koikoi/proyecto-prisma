package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Meli
 * MÓDULO: Reporte Financiero
 *
 * Contrato de casos de uso para el reporte financiero consolidado.
 * Este UseCase consulta la tabla financial_transactions (y opcionalmente
 * las tablas sales y orders directamente) para construir el reporte.
 *
 * TODO Meli: Descomentar y completar los métodos según se implementen.
 *
 * MÉTRICAS A RETORNAR:
 *  - Ingresos por ventas físicas (POS) en un rango de fechas
 *  - Ingresos por ventas online (pedidos)
 *  - Total ingresos brutos
 *  - Egresos por compras a proveedores
 *  - Ganancia bruta = ingresos - egresos de compras
 *  - Margen bruto % = (ganancia / ingresos) * 100
 *  - Lista de transacciones del período (libro diario)
 */
public interface FinancialReportUseCase {

    // TODO Meli: FinancialSummaryDto getSummary(LocalDate from, LocalDate to);
    // TODO Meli: List<FinancialTransactionDto> getTransactions(LocalDate from, LocalDate to, String type);
}
