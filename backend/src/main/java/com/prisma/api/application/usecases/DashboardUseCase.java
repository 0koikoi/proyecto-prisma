package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Dashboard
 *
 * Contrato de casos de uso para el panel principal del Dashboard.
 * Retorna métricas de alto nivel en tiempo real para la vista principal del sistema.
 *
 * DIFERENCIA CON FinancialReportUseCase (Meli):
 *  - DashboardUseCase: datos del DÍA ACTUAL, en tiempo real, de un vistazo.
 *    Incluye gráficos de ventas y margen de ganancias.
 *  - FinancialReportUseCase (Meli): análisis histórico por rango de fechas,
 *    con libro diario de transacciones y exportación CSV/Excel.
 *
 * TODO Keila: Descomentar y completar los métodos según se implementen.
 *
 * DATOS QUE NECESITA EL DASHBOARD (para gráficos):
 *  - Ventas del día (S/)
 *  - Número de transacciones del día
 *  - Ganancia bruta del día (ventas - costo de lo vendido)
 *  - Margen % del día
 *  - Efectivo en caja actual
 *  - Pedidos pendientes (contador)
 *  - Lista de productos con stock bajo (para tarjetas de alerta)
 *  - Ventas de los últimos 7 días (array para el gráfico de línea)
 *  - Ventas por categoría del día (para gráfico de dona/torta)
 */
public interface DashboardUseCase {

    // TODO Keila: DashboardSummaryDto getDailySummary();
    //   → Métricas: ventas hoy, ganancia hoy, margen hoy, efectivo en caja, pedidos pendientes
    //
    // TODO Keila: List<DailySalesDataDto> getWeeklySalesTrend();
    //   → Array de {fecha, totalVentas} de los últimos 7 días para el gráfico de línea
    //
    // TODO Keila: List<CategorySalesDto> getSalesByCategory();
    //   → Array de {categoria, total} del día actual para el gráfico de dona/torta
    //
    // TODO Keila: List<ProductAlertDto> getLowStockAlerts();
    //   → Productos cuyo currentStock <= minStockAlert
}
