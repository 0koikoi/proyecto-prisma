import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Globe,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
} from 'lucide-react';
import { financialService } from './services/financialService';
import { RevenueBarChart } from './components/RevenueBarChart';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { Button } from '../../shared/components/Button';

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const getFirstDayOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const FILTER_OPTIONS = [
  { key: 'TODAS',    label: 'Todas' },
  { key: 'INGRESO',  label: 'Solo Ingresos' },
  { key: 'EGRESO',   label: 'Solo Egresos' },
];

export const FinancialReportsPage = () => {
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonthStr());
  const [dateTo,   setDateTo]   = useState(getTodayStr());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('TODAS');

  const fetchReport = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const data = await financialService.getFinancialReport({ startDate, endDate });
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(dateFrom, dateTo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilterType('TODAS');
    fetchReport(dateFrom, dateTo);
  };

  const filteredTransactions = report?.transactions?.filter((t) =>
    filterType === 'TODAS' ? true : t.type === filterType,
  ) ?? [];

  if (loading) {
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
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => financialService.exportToCsv(report.transactions)}
        >
          Exportar CSV
        </Button>
      </div>

      <div className="filters-card">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <label htmlFor="dateFrom" className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              Desde:
            </label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="dateTo" className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              Hasta:
            </label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" icon={Filter}>
            Aplicar Filtro
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <FinancialMetric
          title="Ventas Físicas (POS)"
          value={formatCurrency(report.totalPhysicalSales)}
          sub="Mostrador — cobros en tienda"
          icon={ShoppingBag}
        />
        <FinancialMetric
          title="Ventas Online / Pedidos"
          value={formatCurrency(report.totalOnlineSales)}
          sub="WhatsApp, Messenger y Tienda Web"
          icon={Globe}
        />
        <FinancialMetric
          title="Total Ingresos Brutos"
          value={formatCurrency(report.totalRevenue)}
          sub="Ventas POS + Ventas Online"
          icon={TrendingUp}
          highlight
        />
        <FinancialMetric
          title="Costo de Mercadería (COGS)"
          value={formatCurrency(report.totalCostOfGoodsSold)}
          sub="Compras a proveedores en el período"
          icon={DollarSign}
        />
        <FinancialMetric
          title="Utilidad Bruta"
          value={formatCurrency(report.grossProfit)}
          sub={`Ingresos Totales − COGS`}
          icon={TrendingUp}
          highlight={report.grossProfit >= 0}
          danger={report.grossProfit < 0}
        />
        <FinancialMetric
          title="Margen Bruto %"
          value={`${report.netMarginPercentage}%`}
          sub={`(Utilidad Bruta / Ingresos Totales) × 100`}
          icon={TrendingUp}
          highlight={report.netMarginPercentage >= 30}
          danger={report.netMarginPercentage < 0}
        />
      </div>

      <RevenueBarChart
        physicalSales={report.totalPhysicalSales}
        onlineSales={report.totalOnlineSales}
        totalCOGS={report.totalCostOfGoodsSold}
      />

      <div className="content-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3>Libro Diario de Transacciones</h3>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilterType(opt.key)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  filterType === opt.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          {filteredTransactions.length === 0
            ? 'No hay transacciones para los filtros seleccionados.'
            : `${filteredTransactions.length} transacción${filteredTransactions.length !== 1 ? 'es' : ''} encontrada${filteredTransactions.length !== 1 ? 's' : ''}`}
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-8 text-xs">
                    Sin transacciones para este filtro en el período seleccionado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinancialMetric = ({
  title,
  value,
  sub,
  icon: Icon,
  highlight = false,
  danger = false,
}) => {
  const cardClass = danger
    ? 'border-red-200 bg-red-50'
    : highlight
    ? 'border-emerald-200 bg-emerald-50'
    : '';

  const iconClass = danger
    ? 'bg-red-100'
    : highlight
    ? 'bg-emerald-100'
    : 'bg-gray-100';

  const iconColor = danger
    ? 'text-red-600'
    : highlight
    ? 'text-emerald-600'
    : 'text-gray-600';

  const valueColor = danger
    ? 'text-red-700'
    : highlight
    ? 'text-emerald-700'
    : 'text-gray-900';

  return (
    <div className={`content-card flex items-start gap-3 ${cardClass}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};
