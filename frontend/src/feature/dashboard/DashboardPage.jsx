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
import { ShoppingCart, DollarSign, Package, TrendingUp, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { dashboardService } from './services/dashboardService';
import { MetricCard } from './components/MetricCard';
import { formatCurrency } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/constants/routes';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    dashboardService.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Cargando métricas del día...
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Panel General — Tienda Prisma</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de operaciones del día en tiempo real.</p>
        </div>
        <Link to={ROUTES.POS} className="btn btn-primary btn-md">
          <ShoppingCart size={17} />
          Ir a Cobrar (POS)
        </Link>
      </div>

      {/* Tarjetas de métricas del día */}
      {/* TODO Keila: reemplazar los valores estáticos con los del endpoint /api/dashboard/summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ventas de Hoy"
          value={formatCurrency(metrics.salesToday)}
          subtitle="Presencial + Online"
          icon={DollarSign}
        />
        <MetricCard
          title="Ganancia Bruta"
          value={formatCurrency(metrics.grossProfitToday)}
          subtitle={`Margen: ${metrics.marginToday}%`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Pedidos Pendientes"
          value={metrics.ordersPending}
          subtitle="Sin despachar"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Efectivo en Caja"
          value={formatCurrency(metrics.cashOnHand)}
          subtitle="Gaveta actual"
          icon={DollarSign}
        />
      </div>

      {/* TODO Keila: GRÁFICO DE LÍNEA — ventas de los últimos 7 días
          Endpoint: GET /api/dashboard/weekly-trend
          Librería sugerida: recharts <LineChart> o <AreaChart>
          Datos: array de { date: '2026-09-01', total: 430.00 }
      */}
      <div className="content-card">
        <h3 className="mb-4">Tendencia de Ventas — Últimos 7 días</h3>
        <div className="h-56 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
          {/* TODO Keila: reemplazar este placeholder con el componente de gráfico */}
          [ Gráfico de línea: LineChart de recharts con datos de weekly-trend ]
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TODO Keila: GRÁFICO DE DONA — ventas por categoría del día
            Endpoint: GET /api/dashboard/by-category
            Librería sugerida: recharts <PieChart> con innerRadius
            Datos: array de { category: 'Femenina', total: 200.00 }
        */}
        <div className="content-card">
          <h3 className="mb-4">Ventas por Categoría (Hoy)</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
            {/* TODO Keila: reemplazar con PieChart / DonutChart */}
            [ Gráfico de dona: PieChart de recharts con datos by-category ]
          </div>
        </div>

        {/* Alertas de stock bajo */}
        {/* TODO Keila: Endpoint GET /api/dashboard/low-stock */}
        <div className="content-card">
          <h3 className="mb-4">⚠ Alertas de Stock Bajo</h3>
          <div className="flex flex-col gap-2">
            {metrics.lowStockAlerts?.length === 0 ? (
              <p className="text-sm text-gray-400">No hay alertas de stock. ✓</p>
            ) : (
              metrics.lowStockAlerts?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="badge badge-neutral text-xs">{item.sku}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-700">{item.stock} un.</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
