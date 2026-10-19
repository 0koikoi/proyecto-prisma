/**
 * Tabla de pedidos y estado de envíos conectada a la API real.
 * Responsable: Zully
 */
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import {
  Truck,
  CheckCircle2,
  Clock,
  Smartphone,
  Globe,
  MessageCircle,
  Eye,
  PackageCheck,
  XCircle,
  Camera,
} from 'lucide-react';
import { ORDER_STATUSES, normalizeStatus, buildWhatsAppUrl } from '../utils/orderStatus';

export const OrdersTable = ({
  orders = [],
  onUpdateStatus,
  onViewDetail,
  onRequestStatusChange,
}) => {
  const getStatusBadge = (statusStr) => {
    const norm = normalizeStatus(statusStr);
    const meta = ORDER_STATUSES[norm] || ORDER_STATUSES.PENDING;

    let icon = <Clock size={12} />;
    if (norm === 'PREPARING') icon = <Truck size={12} />;
    if (norm === 'SHIPPED') icon = <CheckCircle2 size={12} />;
    if (norm === 'DELIVERED') icon = <PackageCheck size={12} />;
    if (norm === 'CANCELLED') icon = <XCircle size={12} />;

    return (
      <span className={meta.badgeClass}>
        {icon} {meta.label.toUpperCase()}
      </span>
    );
  };

  const getChannelBadge = (channel) => {
    const ch = (channel || '').toUpperCase();
    if (ch === 'WHATSAPP') {
      return (
        <span className="badge badge-emerald">
          <MessageCircle size={12} /> WHATSAPP
        </span>
      );
    }
    if (ch === 'MESSENGER') {
      return (
        <span className="badge badge-cyan">
          <Smartphone size={12} /> MESSENGER
        </span>
      );
    }
    if (ch === 'INSTAGRAM') {
      return (
        <span className="badge badge-rose">
          <Camera size={12} /> INSTAGRAM
        </span>
      );
    }
    return (
      <span className="badge badge-purple">
        <Globe size={12} /> WEB
      </span>
    );
  };

  const getAvailableTransitions = (currentStatus) => {
    const norm = normalizeStatus(currentStatus);
    switch (norm) {
      case 'PENDING':
        return [
          { value: 'PENDING', label: 'Pendiente', disabled: true },
          { value: 'PREPARING', label: '→ Iniciar Preparación' },
          { value: 'CANCELLED', label: '✕ Cancelar Pedido' },
        ];
      case 'PREPARING':
        return [
          { value: 'PREPARING', label: 'En Preparación', disabled: true },
          { value: 'SHIPPED', label: '→ Despachar Envío' },
          { value: 'CANCELLED', label: '✕ Cancelar Pedido' },
        ];
      case 'SHIPPED':
        return [
          { value: 'SHIPPED', label: 'Enviado', disabled: true },
          { value: 'DELIVERED', label: '→ Marcar Entregado' },
        ];
      case 'DELIVERED':
        return [{ value: 'DELIVERED', label: 'Entregado (Final)', disabled: true }];
      case 'CANCELLED':
        return [{ value: 'CANCELLED', label: 'Cancelado (Final)', disabled: true }];
      default:
        return [];
    }
  };

  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>CÓDIGO / ALCANCE</th>
            <th>CLIENTE</th>
            <th>CANAL</th>
            <th>TRANSPORTE / GUÍA</th>
            <th>TOTAL</th>
            <th>FECHA</th>
            <th>ESTADO</th>
            <th className="text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                No hay pedidos registrados con el filtro seleccionado.
              </td>
            </tr>
          ) : (
            orders.map((o) => {
              const currentNorm = normalizeStatus(o.shippingStatus || o.status);
              const transitions = getAvailableTransitions(currentNorm);
              const isTerminal = currentNorm === 'DELIVERED' || currentNorm === 'CANCELLED';

              return (
                <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                  <td>
                    <div className="font-mono font-bold text-xs text-gray-900">
                      {o.orderCode || `PED-${o.id}`}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      {o.deliveryScope === 'LOCAL' ? '📍 Local' : '🚚 Nacional'}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-gray-900">{o.customerName}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <span>{o.customerPhone || o.phone}</span>
                      <a
                        href={buildWhatsAppUrl(o)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-0.5"
                        title="Abrir chat de WhatsApp"
                      >
                        <MessageCircle size={13} />
                      </a>
                    </div>
                  </td>
                  <td>{getChannelBadge(o.channel)}</td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">
                      {o.courierCompany || o.courier || 'Por asignar'}
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {o.trackingNumber || (o.deliveryScope === 'LOCAL' ? 'Despacho local' : 'Sin guía')}
                    </div>
                  </td>
                  <td className="font-bold text-gray-950">
                    {formatCurrency(o.totalOrder != null ? o.totalOrder : o.total)}
                  </td>
                  <td className="text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                  <td>{getStatusBadge(o.shippingStatus || o.status)}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail && onViewDetail(o)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Ver detalle del pedido"
                      >
                        <Eye size={14} />
                      </button>

                      {!isTerminal && (
                        <select
                          value={currentNorm}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && val !== currentNorm) {
                              if (onRequestStatusChange) {
                                onRequestStatusChange(o, val);
                              } else if (onUpdateStatus) {
                                onUpdateStatus(o.id, val);
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-xs hover:border-gray-400 transition-colors"
                        >
                          {transitions.map((t) => (
                            <option key={t.value} value={t.value} disabled={t.disabled}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
