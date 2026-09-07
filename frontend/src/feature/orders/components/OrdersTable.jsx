/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos y Logística de Envíos — Tabla de Órdenes
 *
 * Muestra el listado de pedidos recibidos por canales digitales
 * (WhatsApp, Messenger, Tienda Online) y couriers (Shalom, Comité 6, Motorizado).
 *
 * TODO Zully:
 *  - Conectar el selector de estado con ordersService.updateOrderStatus(orderId, newStatus).
 *  - Implementar modal de detalle para ver productos solicitados y foto/evidencia de envío (RF17).
 *  - Agregar filtro rápido por Courier o Canal de venta.
 */
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { Truck, CheckCircle2, Clock, Smartphone, Globe, MessageCircle } from 'lucide-react';

export const OrdersTable = ({ orders, onUpdateStatus }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={13} /> Enviado
          </span>
        );
      case 'EN_PREPARACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Truck size={13} /> En preparación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <Clock size={13} /> Pendiente
          </span>
        );
    }
  };

  const getChannelBadge = (channel) => {
    if (channel === 'WhatsApp') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MessageCircle size={12} /> WhatsApp
        </span>
      );
    }
    if (channel === 'Messenger') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Smartphone size={12} /> Messenger
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        <Globe size={12} /> Web
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID Pedido</th>
            <th>Cliente</th>
            <th>Canal</th>
            <th>Courier / Envío</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th className="text-right">Actualizar Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="font-mono font-bold text-xs text-gray-900">{o.id}</td>
              <td>
                <div className="font-semibold text-gray-900">{o.customerName}</div>
                <div className="text-xs text-gray-500">{o.phone}</div>
              </td>
              <td>{getChannelBadge(o.channel)}</td>
              <td>
                <div className="text-sm font-medium text-gray-900">{o.courier}</div>
                <div className="text-xs font-mono text-gray-500">{o.trackingNumber}</div>
              </td>
              <td className="font-bold text-gray-950">{formatCurrency(o.total)}</td>
              <td className="text-xs text-gray-500">{formatDate(o.createdAt)}</td>
              <td>{getStatusBadge(o.status)}</td>
              <td className="text-right">
                <select
                  value={o.status}
                  onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer shadow-sm"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PREPARACION">En Preparación</option>
                  <option value="ENVIADO">Enviado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
