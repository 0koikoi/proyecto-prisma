/**
 * Servicio mock del Dashboard.
 *
 * RESPONSABLE: Keila
 * MÓDULO: Dashboard
 *
 * TODO Keila: Reemplazar los datos estáticos por llamadas reales a la API de Spring Boot.
 *   - getDailySummary()    → GET /api/dashboard/summary
 *   - getWeeklyTrend()     → GET /api/dashboard/weekly-trend
 *   - getSalesByCategory() → GET /api/dashboard/by-category
 *   - getLowStockAlerts()  → GET /api/dashboard/low-stock
 *
 * NUEVOS CAMPOS vs dashboard anterior:
 *   Se agrega grossProfitToday y marginToday para las métricas de rentabilidad.
 *   Estos se calculan en el backend con: sum(unitPrice - unitCost) de las ventas del día.
 */
export const dashboardService = {
  async getMetrics() {
    // TODO Keila: reemplazar con apiClient.get('/dashboard/summary')
    return {
      salesToday: 430.0,
      grossProfitToday: 185.0,  // ventas - costo de lo vendido hoy
      marginToday: 43.0,         // porcentaje de margen del día
      ordersPending: 2,
      cashOnHand: 250.0,
      lowStockAlerts: [
        { id: 3, name: 'Capa Impermeable Mascota M', sku: 'PET-003', stock: 1 },
        { id: 4, name: 'Jogger Cargo Beige', sku: 'URB-004', stock: 0 },
      ],
      // TODO Keila: agregar weeklyTrend y salesByCategory cuando conectes los gráficos
    };
  },
};
