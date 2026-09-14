import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const formatSoles = (value) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-bold text-gray-900 ml-auto">{formatSoles(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueBarChart = ({ physicalSales, onlineSales, totalCOGS }) => {
  const data = [
    {
      canal: 'Ventas POS\n(Mostrador)',
      monto: physicalSales,
      color: '#1c1c1c',
    },
    {
      canal: 'Ventas Online\n(WhatsApp / Web)',
      monto: onlineSales,
      color: '#0891b2',
    },
    {
      canal: 'Costo\nMercadería (COGS)',
      monto: totalCOGS,
      color: '#dc2626',
    },
  ];

  return (
    <div className="content-card">
      <div className="mb-4">
        <h3>Comparativo de Canales de Ingreso</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Ventas físicas en mostrador vs ventas online vs costo de mercadería vendida (período seleccionado)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          barSize={52}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="canal"
            tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={formatSoles}
            tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5', radius: 6 }} />
          <Bar dataKey="monto" name="Monto" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#1c1c1c]" />
          <span className="text-xs text-gray-600">Ventas POS (Mostrador)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#0891b2]" />
          <span className="text-xs text-gray-600">Ventas Online (WhatsApp / Web)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#dc2626]" />
          <span className="text-xs text-gray-600">COGS (Costo Mercadería)</span>
        </div>
      </div>
    </div>
  );
};
