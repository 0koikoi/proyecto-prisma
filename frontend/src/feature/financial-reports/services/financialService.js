/**
 * RESPONSABLE: Meli
 * MÓDULO: Reportes Financieros y Rentabilidad — Servicios
 *
 * Conecta el cálculo de ingresos consolidados (ventas POS + pedidos online),
 * egresos por compra de mercadería a proveedores, utilidad bruta y margen % con Spring Boot.
 *
 * ENDPOINTS ASOCIADOS (Sprint 7):
 *  - GET /api/finance/summary?startDate=...&endDate=... -> Resumen consolidado del período
 *  - GET /api/finance/transactions                      -> Libro diario de transacciones
 *  - GET /api/finance/export/csv                        -> Descarga de reporte en archivo CSV (RF21)
 *
 * TODO Meli:
 *  - Implementar la función exportToCsv() descargando el blob desde el backend o generando el archivo en cliente.
 *  - Validar cálculos de margen neto y bruto con la dueña de Tienda Prisma.
 */
import { apiClient } from '../../../core/api/apiClient';

export const financialService = {
  /**
   * Obtiene el consolidado financiero filtrado por rango de fechas.
   * @param {Object} [filters]
   * @param {string} [filters.startDate] - Formato YYYY-MM-DD
   * @param {string} [filters.endDate] - Formato YYYY-MM-DD
   */
  async getFinancialReport(filters = {}) {
    // Modo producción con backend:
    // const params = new URLSearchParams(filters).toString();
    // return apiClient.get(`/finance/summary?${params}`);

    console.log('[Mock Finanzas] Consultando reporte con filtros:', filters);

    return {
      period: {
        startDate: filters.startDate || '2026-09-01',
        endDate: filters.endDate || '2026-09-06',
      },
      totalPhysicalSales: 2450.0,   // Ventas en mostrador POS
      totalOnlineSales: 1680.0,     // Pedidos WhatsApp / Tienda Online
      totalRevenue: 4130.0,         // Total Ingresos (Físico + Online)
      totalCostOfGoodsSold: 2150.0, // Costo de compra de lo vendido (cost_price)
      grossProfit: 1980.0,          // Utilidad Bruta (Ingresos - Costos)
      netMarginPercentage: 47.9,    // Margen Bruto (%)
      transactions: [
        {
          id: 1,
          date: '2026-09-06T14:30:00Z',
          type: 'INGRESO',
          channel: 'Presencial (POS)',
          method: 'YAPE',
          amount: 69.90,
          desc: 'Venta Ticket #TK-98124',
        },
        {
          id: 2,
          date: '2026-09-06T13:10:00Z',
          type: 'INGRESO',
          channel: 'Online (WhatsApp)',
          method: 'PLIN',
          amount: 125.00,
          desc: 'Pedido #ORD-1001 (Lucía Morales)',
        },
        {
          id: 3,
          date: '2026-09-06T11:00:00Z',
          type: 'INGRESO',
          channel: 'Presencial (POS)',
          method: 'EFECTIVO',
          amount: 89.00,
          desc: 'Venta Ticket #TK-98123',
        },
        {
          id: 4,
          date: '2026-09-05T16:00:00Z',
          type: 'EGRESO',
          channel: 'Compra Proveedor',
          method: 'TRANSFERENCIA',
          amount: 450.00,
          desc: 'Reposición Textiles Gamarra Fact #F001-209',
        },
      ],
    };
  },

  /**
   * RF21: Exporta el reporte financiero en formato CSV para abrirlo en Microsoft Excel.
   */
  exportToCsv(transactions) {
    const headers = ['ID', 'Fecha', 'Tipo', 'Canal', 'Medio de Pago', 'Monto (S/)', 'Descripcion'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.channel}"`,
      t.method,
      t.amount.toFixed(2),
      `"${t.desc}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_financiero_prisma_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
