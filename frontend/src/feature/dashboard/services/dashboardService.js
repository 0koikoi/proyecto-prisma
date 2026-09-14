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
 */
export const dashboardService = {
  async getMetrics() {
    return {
      salesToday: 4300.0,
      salesTarget: 5200.0,
      grossProfitToday: 1850.0,
      marginToday: 43.0,
      ordersPending: 2,
      cashOnHand: 2500.0,
      avgTicket: 184.5,
      conversionRate: 8.6,
      newCustomers: 18,
      lowStockAlerts: [
        { id: 3, name: 'Capa Impermeable Mascota M', sku: 'PET-003', stock: 1 },
        { id: 4, name: 'Jogger Cargo Beige', sku: 'URB-004', stock: 0 },
        { id: 5, name: 'Blusa Oversize White', sku: 'FEM-112', stock: 2 },
      ],
      weeklyTrend: [
        { day: 'Lun', total: 1320 },
        { day: 'Mar', total: 1480 },
        { day: 'Mié', total: 1660 },
        { day: 'Jue', total: 1820 },
        { day: 'Vie', total: 2130 },
        { day: 'Sáb', total: 1960 },
        { day: 'Dom', total: 1700 },
      ],
      salesByCategory: [
        { category: 'Femenina', total: 1800, percentage: 42, itemsSold: 88, color: '#1c1c1c' },
        { category: 'Urbana', total: 1450, percentage: 34, itemsSold: 71, color: '#7c3aed' },
        { category: 'Mascotas', total: 1050, percentage: 24, itemsSold: 49, color: '#0891b2' },
      ],
      recentOrders: [
        { id: '#1041', customer: 'María R.', line: '2 prendas', total: 245, status: 'En tránsito', time: 'Hace 12 min' },
        { id: '#1042', customer: 'Lucía T.', line: '1 conjunto', total: 320, status: 'Listo', time: 'Hace 24 min' },
        { id: '#1043', customer: 'Daniel C.', line: '3 accesorios', total: 189, status: 'Pendiente', time: 'Hace 41 min' },
      ],
      topProducts: [
        { name: 'Chaqueta Oversize', sku: 'FEM-204', sales: 38, revenue: 920, stock: 14, delta: 18 },
        { name: 'Jogger Cargo Beige', sku: 'URB-004', sales: 33, revenue: 815, stock: 0, delta: 11 },
        { name: 'Capa Impermeable', sku: 'PET-003', sales: 27, revenue: 690, stock: 1, delta: 9 },
        { name: 'Blusa White', sku: 'FEM-112', sales: 25, revenue: 560, stock: 2, delta: 7 },
        { name: 'Pantalón Clásico', sku: 'URB-118', sales: 21, revenue: 470, stock: 8, delta: 6 },
      ],
    };
  },
};
