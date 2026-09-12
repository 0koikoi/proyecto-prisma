/**
 * Tabla de pedidos y estado de envíos.
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
          <span className="badge badge-emerald">
            <CheckCircle2 size={12} /> ENVIADO
          </span>
        );
      case 'EN_PREPARACION':
        return (
          <span className="badge badge-amber">
            <Truck size={12} /> EN PREPARACIÓN
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral">
            <Clock size={12} /> PENDIENTE
          </span>
        );
    }
  };

  const getChannelBadge = (channel) => {
    if (channel === 'WhatsApp') {
      return (
        <span className="badge badge-emerald">
          <MessageCircle size={12} /> WHATSAPP
        </span>
      );
    }
    if (channel === 'Messenger') {
      return (
        <span className="badge badge-cyan">
          <Smartphone size={12} /> MESSENGER
        </span>
      );
    }
    return (
      <span className="badge badge-purple">
        <Globe size={12} /> WEB
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID PEDIDO</th>
            <th>CLIENTE</th>
            <th>CANAL</th>
            <th>COURIER / ENVÍO</th>
            <th>TOTAL</th>
            <th>FECHA</th>
            <th>ESTADO</th>
            <th className="text-right">ACTUALIZAR ESTADO</th>
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
            orders.map((o) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
