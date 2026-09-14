import { apiClient } from '../../../core/api/apiClient';

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: '2026-09-06T14:30:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'YAPE',
    amount: 69.90,
    desc: 'Venta Ticket #TK-98124',
  },
  {
    id: 2,
    date: '2026-09-06T11:00:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'EFECTIVO',
    amount: 89.00,
    desc: 'Venta Ticket #TK-98123',
  },
  {
    id: 3,
    date: '2026-09-05T10:15:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'PLIN',
    amount: 75.00,
    desc: 'Venta Ticket #TK-98119',
  },
  {
    id: 4,
    date: '2026-09-05T09:45:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'EFECTIVO',
    amount: 140.00,
    desc: 'Venta Ticket #TK-98118 (2 artículos)',
  },
  {
    id: 5,
    date: '2026-09-04T15:20:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'TARJETA',
    amount: 89.00,
    desc: 'Venta Ticket #TK-98110',
  },
  {
    id: 6,
    date: '2026-09-04T13:00:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'YAPE',
    amount: 35.00,
    desc: 'Venta Ticket #TK-98108',
  },
  {
    id: 7,
    date: '2026-09-03T12:30:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'EFECTIVO',
    amount: 159.80,
    desc: 'Venta Ticket #TK-98102 (múltiples)',
  },
  {
    id: 8,
    date: '2026-09-03T11:00:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'PLIN',
    amount: 69.90,
    desc: 'Venta Ticket #TK-98100',
  },
  {
    id: 9,
    date: '2026-09-02T16:00:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'EFECTIVO',
    amount: 75.00,
    desc: 'Venta Ticket #TK-98090',
  },
  {
    id: 10,
    date: '2026-09-01T14:00:00Z',
    type: 'INGRESO',
    channel: 'Presencial (POS)',
    category: 'VENTA_POS',
    method: 'YAPE',
    amount: 89.00,
    desc: 'Venta Ticket #TK-98080',
  },
  {
    id: 11,
    date: '2026-09-06T13:10:00Z',
    type: 'INGRESO',
    channel: 'Online (WhatsApp)',
    category: 'VENTA_ONLINE',
    method: 'PLIN',
    amount: 125.00,
    desc: 'Pedido #ORD-1001 (Lucía Morales)',
  },
  {
    id: 12,
    date: '2026-09-06T12:15:00Z',
    type: 'INGRESO',
    channel: 'Online (Tienda Web)',
    category: 'VENTA_ONLINE',
    method: 'TRANSFERENCIA',
    amount: 89.00,
    desc: 'Pedido #ORD-1002 (Carlos Ruiz)',
  },
  {
    id: 13,
    date: '2026-09-05T09:40:00Z',
    type: 'INGRESO',
    channel: 'Online (Messenger)',
    category: 'VENTA_ONLINE',
    method: 'YAPE',
    amount: 155.00,
    desc: 'Pedido #ORD-1003 (Andrea Silva)',
  },
  {
    id: 14,
    date: '2026-09-04T17:00:00Z',
    type: 'INGRESO',
    channel: 'Online (WhatsApp)',
    category: 'VENTA_ONLINE',
    method: 'PLIN',
    amount: 125.00,
    desc: 'Pedido #ORD-1004 (María Torres)',
  },
  {
    id: 15,
    date: '2026-09-03T08:30:00Z',
    type: 'INGRESO',
    channel: 'Online (WhatsApp)',
    category: 'VENTA_ONLINE',
    method: 'TRANSFERENCIA',
    amount: 175.00,
    desc: 'Pedido #ORD-1005 (Jorge Quispe)',
  },
  {
    id: 16,
    date: '2026-09-02T11:00:00Z',
    type: 'INGRESO',
    channel: 'Online (Messenger)',
    category: 'VENTA_ONLINE',
    method: 'YAPE',
    amount: 69.90,
    desc: 'Pedido #ORD-1006 (Rosa Mendez)',
  },
  {
    id: 17,
    date: '2026-09-01T10:00:00Z',
    type: 'INGRESO',
    channel: 'Online (Tienda Web)',
    category: 'VENTA_ONLINE',
    method: 'TRANSFERENCIA',
    amount: 210.00,
    desc: 'Pedido #ORD-1007 (Luis Flores)',
  },
  {
    id: 18,
    date: '2026-09-05T16:00:00Z',
    type: 'EGRESO',
    channel: 'Compra Proveedor',
    category: 'COMPRA_MERCADERIA',
    method: 'TRANSFERENCIA',
    amount: 450.00,
    desc: 'Reposición Textiles Gamarra Fact #F001-209',
  },
  {
    id: 19,
    date: '2026-09-03T10:00:00Z',
    type: 'EGRESO',
    channel: 'Compra Proveedor',
    category: 'COMPRA_MERCADERIA',
    method: 'TRANSFERENCIA',
    amount: 360.00,
    desc: 'Reposición Pet Fashion Perú Fact #F002-055',
  },
  {
    id: 20,
    date: '2026-09-01T09:00:00Z',
    type: 'EGRESO',
    channel: 'Compra Proveedor',
    category: 'COMPRA_MERCADERIA',
    method: 'TRANSFERENCIA',
    amount: 540.00,
    desc: 'Reposición Textiles Gamarra Fact #F001-198 (stock inicial mes)',
  },
];

export const financialService = {
  async getFinancialReport(filters = {}) {
    // const params = new URLSearchParams(filters).toString();
    // return apiClient.get(`/finance/summary?${params}`);

    let transactions = [...MOCK_TRANSACTIONS];
    if (filters.startDate || filters.endDate) {
      const from = filters.startDate ? new Date(filters.startDate + 'T00:00:00Z') : new Date(0);
      const to = filters.endDate ? new Date(filters.endDate + 'T23:59:59Z') : new Date();
      transactions = MOCK_TRANSACTIONS.filter((t) => {
        const txDate = new Date(t.date);
        return txDate >= from && txDate <= to;
      });
    }

    const totalPhysicalSales = transactions
      .filter((t) => t.type === 'INGRESO' && t.category === 'VENTA_POS')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOnlineSales = transactions
      .filter((t) => t.type === 'INGRESO' && t.category === 'VENTA_ONLINE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRevenue = totalPhysicalSales + totalOnlineSales;

    const totalCostOfGoodsSold = transactions
      .filter((t) => t.type === 'EGRESO' && t.category === 'COMPRA_MERCADERIA')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = totalRevenue - totalCostOfGoodsSold;

    const netMarginPercentage = totalRevenue > 0
      ? parseFloat(((grossProfit / totalRevenue) * 100).toFixed(1))
      : 0;

    return {
      period: {
        startDate: filters.startDate || '2026-09-01',
        endDate: filters.endDate || '2026-09-06',
      },
      totalPhysicalSales: parseFloat(totalPhysicalSales.toFixed(2)),
      totalOnlineSales: parseFloat(totalOnlineSales.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCostOfGoodsSold: parseFloat(totalCostOfGoodsSold.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      netMarginPercentage,
      transactions,
    };
  },

  exportToCsv(transactions) {
    const headers = [
      'ID',
      'Fecha',
      'Tipo',
      'Canal / Categoría',
      'Medio de Pago',
      'Monto (S/)',
      'Descripción',
    ];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleString('es-PE'),
      t.type,
      `"${t.channel}"`,
      t.method,
      t.amount.toFixed(2),
      `"${t.desc}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `reporte_financiero_prisma_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
