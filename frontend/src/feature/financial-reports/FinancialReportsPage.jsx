/**
 * RESPONSABLE: Meli
 * MÓDULO: Reporte Financiero
 *
 * Página de análisis financiero histórico de Tienda Prisma.
 * DIFERENTE al Dashboard de Keila: aquí se trabaja con rangos de fechas,
 * exportación a CSV y el libro diario de transacciones.
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Selector de rango de fechas (from / to) y botón "Aplicar"
 *  2. Tarjetas resumen:
 *     - Ingresos por ventas físicas (POS)
 *     - Ingresos por ventas online (pedidos)
 *     - Total ingresos brutos
 *     - Costo de mercadería vendida (suma de unitCost × quantity)
 *     - Ganancia bruta = Ingresos − Costos
 *     - Margen bruto % = (Ganancia / Ingresos) × 100
 *  3. Tabla de transacciones: libro diario filtrable por tipo (INGRESO/EGRESO)
 *     y por categoría (VENTA_POS, VENTA_ONLINE, COMPRA_MERCADERIA, etc.)
 *  4. Botón "Exportar CSV" (RF21 del plan prisma.md)
 *
 * CONEXIÓN CON BACKEND:
 *  - GET /api/finance/summary?from=&to=     → balance del período
 *  - GET /api/finance/transactions?from=&to=&type= → libro diario
 *  - GET /api/finance/export/csv?from=&to=  → descarga CSV
 *
 * TODO Meli: Implementar el selector de rango de fechas (usar un date picker o dos <input type="date">).
 * TODO Meli: Conectar con GET /api/finance/summary pasando from y to como query params.
 * TODO Meli: Conectar con GET /api/finance/transactions para la tabla.
 * TODO Meli: Implementar el botón de exportación CSV (puede ser un <a href="/api/finance/export/csv">).
 * TODO Meli: Solo accesible para el rol ADMIN (el Vendedor no ve este módulo).
 * TODO Meli: Coordinar con Leo y Zully para validar que sus UseCases registren correctamente
 *            en FinancialTransaction al cerrar una venta o confirmar un pedido.
 */
import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Globe, DollarSign, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';
import { financialService } from './services/financialService';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { Button } from '../../shared/components/Button';

export const FinancialReportsPage = () => {
  const [report, setReport] = useState(null);
  // TODO Meli: agregar estado para las fechas del filtro
  // const [dateFrom, setDateFrom] = useState('');
  // const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    // TODO Meli: pasar { from: dateFrom, to: dateTo } al servicio
    financialService.getFinancialReport().then(setReport);
  }, []);

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Cargando reporte financiero...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Reporte Financiero Consolidado</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Balance de ingresos y egresos — ventas físicas, online y compras a proveedores.
          </p>
        </div>
        {/* RF21: Exportar CSV para Excel */}
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => financialService.exportToCsv(report.transactions)}
        >
          Exportar CSV
        </Button>
      </div>

      {/* Selector de rango de fechas — preparado para Meli */}
      <div className="filters-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            financialService.getFinancialReport().then(setReport);
          }}
          className="flex flex-wrap gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="dateFrom" className="text-xs font-semibold text-gray-600">Desde:</label>
            <input
              id="dateFrom"
              type="date"
              defaultValue="2026-09-01"
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="dateTo" className="text-xs font-semibold text-gray-600">Hasta:</label>
            <input
              id="dateTo"
              type="date"
              defaultValue="2026-09-06"
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Aplicar Filtro
          </Button>
        </form>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <FinancialMetric title="Ventas Físicas (POS)" value={formatCurrency(report.totalPhysicalSales)} sub="Mostrador tienda" icon={ShoppingBag} />
        <FinancialMetric title="Ventas Online / Pedidos" value={formatCurrency(report.totalOnlineSales)} sub="WhatsApp, Messenger y Web" icon={Globe} />
        <FinancialMetric title="Total Ingresos Brutos" value={formatCurrency(report.totalRevenue)} sub="100% de ventas" icon={TrendingUp} highlight />
        <FinancialMetric title="Costo de Mercadería Vendida" value={formatCurrency(report.totalCostOfGoodsSold)} sub="Compras a proveedores" icon={DollarSign} />
        <FinancialMetric title="Ganancia Bruta" value={formatCurrency(report.grossProfit)} sub={`Margen: ${report.netMarginPercentage}%`} icon={TrendingUp} />
      </div>

      {/* Libro diario de transacciones */}
      <div className="content-card">
        <h3 className="mb-4">Libro Diario de Transacciones</h3>
        <p className="text-xs text-gray-400 mb-4">
          {/* TODO Meli: agregar filtro por tipo (INGRESO/EGRESO) y por categoría */}
          [ Agregar filtros de tipo y categoría ]
        </p>
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Canal / Categoría</th>
                <th>Método de Pago</th>
                <th>Fecha</th>
                <th className="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {report.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td>
                    {t.type === 'INGRESO' ? (
                      <span className="badge badge-success flex items-center gap-1">
                        <ArrowDownLeft size={12} /> Ingreso
                      </span>
                    ) : (
                      <span className="badge badge-danger flex items-center gap-1">
                        <ArrowUpRight size={12} /> Egreso
                      </span>
                    )}
                  </td>
                  <td className="font-medium">{t.desc}</td>
                  <td><span className="badge badge-neutral">{t.channel}</span></td>
                  <td><code className="text-xs">{t.method}</code></td>
                  <td className="text-gray-500">{formatDate(t.date)}</td>
                  <td className={`text-right font-bold ${t.type === 'INGRESO' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'INGRESO' ? '+' : '−'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinancialMetric = ({ title, value, sub, icon: Icon, highlight = false }) => (
  <div className={`content-card flex items-start gap-3 ${highlight ? 'border-emerald-200 bg-emerald-50' : ''}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${highlight ? 'bg-emerald-100' : 'bg-gray-100'}`}>
      <Icon size={20} className={highlight ? 'text-emerald-600' : 'text-gray-600'} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  </div>
);
