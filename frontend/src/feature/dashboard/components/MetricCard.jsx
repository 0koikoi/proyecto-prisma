/**
 * RESPONSABLE: Keila
 * MÓDULO: Dashboard — Tarjeta de Métrica
 *
 * Componente para mostrar KPIs principales en el Dashboard y paneles de resumen.
 *
 * TODO Keila:
 *  - Agregar prop opcional para indicar tendencia porcentual (+12% vs ayer).
 *  - Soportar estado de carga (skeleton loader) mientras se consumen los datos reales.
 */
export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'gray',
}) => {
  const colorMap = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-900', border: 'border-gray-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };

  const scheme = colorMap[color] || colorMap.gray;

  return (
    <div className="content-card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${scheme.bg} ${scheme.text}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
          {title}
        </span>
        <h3 className="text-2xl font-black text-gray-950 tracking-tight leading-none mb-1">
          {value}
        </h3>
        <div className="flex items-center gap-2">
          {subtitle && (
            <span className="text-xs text-gray-500 truncate block">
              {subtitle}
            </span>
          )}
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
