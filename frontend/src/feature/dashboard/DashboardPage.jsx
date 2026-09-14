/**
 * RESPONSABLE: Keila
 * MÓDULO: Dashboard
 *
 * Página principal del panel de gestión de Tienda Prisma.
 * Diseño: GRÁFICO y visual, con métricas del DÍA en tiempo real.
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Tarjetas de métricas del día (ventas, ganancia, margen %, efectivo en caja)
 *  2. Gráfico de LÍNEA: ventas de los últimos 7 días (usar recharts o chart.js)
 *  3. Gráfico de DONA/TORTA: ventas por categoría (Femenina, Urbana, Mascotas)
 *  4. Panel de alertas de stock bajo (tarjetas de los productos por agotarse)
 *  5. Accesos rápidos (botones a POS y Caja)
 *
 * CONEXIÓN CON BACKEND:
 *  - GET /api/dashboard/summary      → métricas del día
 *  - GET /api/dashboard/weekly-trend → datos para el gráfico de línea
 *  - GET /api/dashboard/by-category  → datos para el gráfico de dona
 *  - GET /api/dashboard/low-stock    → alertas de stock
 *
 * TODO Keila: Instalar librería de gráficos (recharts recomendado: npm install recharts).
 * TODO Keila: Reemplazar los datos mock del servicio por la llamada real a la API.
 * TODO Keila: Implementar el selector de rango de fechas para filtrar el gráfico.
 * TODO Keila: El rol VENDEDOR ve solo métricas del día (sin gráficos de rentabilidad).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Clock3,
  DollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { dashboardService } from './services/dashboardService';
import { MetricCard } from './components/MetricCard';
import { formatCurrency } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/constants/routes';

const quickActions = [
  { label: 'Cobrar', to: ROUTES.POS, icon: ShoppingCart, tone: 'dark' },
  { label: 'Caja', to: ROUTES.CASH_REGISTER, icon: Wallet, tone: 'light' },
  { label: 'Inventario', to: ROUTES.INVENTORY, icon: Package, tone: 'light' },
  { label: 'Reportes', to: ROUTES.FINANCIAL_REPORTS, icon: BarChart3, tone: 'light' },
];

const getStatusClass = (status) => {
  if (status === 'Listo') return 'badge-emerald';
  if (status === 'En tránsito') return 'badge-amber';
  return 'badge-neutral';
};

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    dashboardService.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Cargando métricas del día...
      </div>
    );
  }

  const maxTrend = Math.max(...metrics.weeklyTrend.map((item) => item.total), 1);
  const totalCategorySales = metrics.salesByCategory.reduce((sum, item) => sum + item.total, 0);
  const progressPct = Math.min((metrics.salesToday / metrics.salesTarget) * 100, 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1c1c1c]/60">
            Tienda Prisma
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1c1c1c]">
            Panel general
          </h1>
          <p className="page-subtitle mt-1">
            Resumen operativo del día · {new Intl.DateTimeFormat('es-PE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[#d6efff] bg-[#d6efff]/70 px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1c1c1c]">
              <Sparkles size={16} className="text-[#1c1c1c]" />
              Meta del día: {Math.round(progressPct)}%
            </div>
          </div>

          <Link to={ROUTES.POS} className="btn btn-primary btn-md">
            <ShoppingCart size={17} />
            Ir a Cobrar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ventas de Hoy"
          value={formatCurrency(metrics.salesToday)}
          subtitle="Presencial + Online"
          trend="+12.4% vs ayer"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Ganancia Bruta"
          value={formatCurrency(metrics.grossProfitToday)}
          subtitle={`Margen: ${metrics.marginToday}%`}
          trend="+8.1%"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Pedidos Pendientes"
          value={metrics.ordersPending}
          subtitle="Sin despachar"
          trend="2 por revisar"
          icon={ShoppingCart}
          color="amber"
        />
        <MetricCard
          title="Efectivo en Caja"
          value={formatCurrency(metrics.cashOnHand)}
          subtitle="Gaveta actual"
          trend="Estable"
          icon={Wallet}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="content-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Resumen operativo
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">
                Rendimiento del día
              </h3>
            </div>
            <span className="badge badge-secondary">
              Objetivo: {formatCurrency(metrics.salesTarget)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                <Target size={14} />
                Ticket promedio
              </div>
              <p className="mt-3 text-2xl font-black text-[#1c1c1c]">
                {formatCurrency(metrics.avgTicket)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Competencia directa</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                <BadgeCheck size={14} />
                Conversión
              </div>
              <p className="mt-3 text-2xl font-black text-[#1c1c1c]">
                {metrics.conversionRate}%
              </p>
              <p className="mt-1 text-xs text-gray-500">En visitas del día</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                <Clock3 size={14} />
                Nuevos clientes
              </div>
              <p className="mt-3 text-2xl font-black text-[#1c1c1c]">
                {metrics.newCustomers}
              </p>
              <p className="mt-1 text-xs text-gray-500">Récord en la semana</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[#1c1c1c]">Progreso hacia la meta</span>
              <span className="font-bold text-[#1c1c1c]">
                {formatCurrency(metrics.salesToday)} / {formatCurrency(metrics.salesTarget)}
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1c1c1c] via-[#1f7ecc] to-[#d6efff]"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#d6efff] bg-[#ecfeff] px-3 py-1.5 text-xs font-semibold text-[#1c1c1c]">
                +{Math.round(((metrics.salesToday - metrics.salesTarget * 0.7) / (metrics.salesTarget * 0.7)) * 100)}% sobre el tramo base
              </div>
              <div className="rounded-full border border-[#d6efff] bg-[#f5f3ff] px-3 py-1.5 text-xs font-semibold text-[#1c1c1c]">
                Margen sólido: {metrics.marginToday}%
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Accesos rápidos
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">Operación</h3>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, to, icon: Icon, tone }) => (
              <Link
                key={label}
                to={to}
                className={`group rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  tone === 'dark'
                    ? 'border-[#1c1c1c] bg-[#1c1c1c] text-white'
                    : 'border-gray-200 bg-[#f9fafb] text-[#1c1c1c]'
                }`}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    tone === 'dark' ? 'bg-white/10 text-white' : 'bg-[#d6efff] text-[#1c1c1c]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{label}</span>
                  <ArrowRight size={16} className="opacity-70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="content-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Tendencia
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">
                Ventas de los últimos 7 días
              </h3>
            </div>
            <span className="badge badge-ice">Últimos 7 días</span>
          </div>

          <div className="mt-6 flex h-52 items-end gap-3">
            {metrics.weeklyTrend.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#1c1c1c] via-[#1f7ecc] to-[#d6efff] shadow-sm"
                    style={{ height: `${(item.total / maxTrend) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                    {item.day}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#1c1c1c]">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Distribución
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">Ventas por categoría</h3>
            </div>
            <span className="badge badge-neutral">Hoy</span>
          </div>

          <div className="mt-5 space-y-4">
            {metrics.salesByCategory.map((item) => (
              <div key={item.category} className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-semibold text-[#1c1c1c]">{item.category}</span>
                  </div>
                  <span className="text-sm font-black text-[#1c1c1c]">
                    {formatCurrency(item.total)}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{item.percentage}% del total</span>
                  <span>{item.itemsSold} prendas</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#d6efff] bg-[#ecfeff] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Participación total
            </p>
            <p className="mt-1 text-xl font-black text-[#1c1c1c]">
              {formatCurrency(totalCategorySales)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="content-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Stock
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">Alertas de stock bajo</h3>
            </div>
            <span className="badge badge-warning">{metrics.lowStockAlerts.length} items</span>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.lowStockAlerts.length === 0 ? (
              <p className="text-sm text-gray-400">No hay alertas de stock. ✓</p>
            ) : (
              metrics.lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1c1c1c]">{item.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="badge badge-neutral text-[10px]">{item.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-amber-700">{item.stock} un.</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                      Reponer pronto
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Actividad
              </p>
              <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">Pedidos recientes</h3>
            </div>
            <span className="badge badge-secondary">Hoy</span>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#f9fafb] p-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#1c1c1c]">{order.customer}</p>
                  <p className="text-xs text-gray-500">
                    {order.id} · {order.line} · {order.time}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-[#1c1c1c]">{formatCurrency(order.total)}</p>
                  <span className={`badge ${getStatusClass(order.status)} text-[10px]`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Productos
            </p>
            <h3 className="mt-1 text-xl font-black text-[#1c1c1c]">Top vendidos</h3>
          </div>
          <span className="badge badge-emerald">Top 5</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metrics.topProducts.map((product) => (
            <div key={product.sku} className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  {product.sku}
                </span>
                <span className="badge badge-emerald text-[10px]">+{product.delta}%</span>
              </div>

              <h4 className="mt-3 text-base font-black text-[#1c1c1c]">{product.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{product.sales} ventas</p>

              <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                  Ingreso
                </p>
                <p className="mt-1 text-lg font-black text-[#1c1c1c]">
                  {formatCurrency(product.revenue)}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Stock</span>
                <span className="font-bold text-[#1c1c1c]">{product.stock} un.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
