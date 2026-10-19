/**
 * Modal para visualizar el detalle completo de un pedido, productos, courier, historial y acciones de estado.
 * Responsable: Zully
 */
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import {
  User,
  Phone,
  MapPin,
  Truck,
  MessageCircle,
  FileText,
  Calendar,
  Package,
  Camera,
  CheckCircle2,
  Clock,
  History,
  AlertTriangle,
  XCircle,
  Car,
} from 'lucide-react';
import { ORDER_STATUSES, normalizeStatus, buildWhatsAppUrl } from '../utils/orderStatus';

export const OrderDetailModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  if (!order) return null;

  const currentNorm = normalizeStatus(order.shippingStatus || order.status);
  const statusMeta = ORDER_STATUSES[currentNorm] || ORDER_STATUSES.PENDING;

  const handleActionClick = (targetStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(order.id, targetStatus);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle del Pedido: ${order.orderCode || '#' + order.id}`}
      maxWidth="680px"
    >
      <div className="space-y-4">
        {/* Cabecera resumen */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={13} /> Registrado el {formatDate(order.createdAt)}
            </div>
            <div className="text-xs font-semibold text-gray-800 mt-0.5">
              Canal: <span className="font-bold">{order.channel || 'VENTA DIGITAL'}</span>
              <span className="mx-2 text-gray-300">|</span>
              Alcance:{' '}
              <span className="font-bold">
                {order.deliveryScope === 'LOCAL' ? 'Despacho Local (Tacna)' : 'Envío Nacional'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={statusMeta.badgeClass}>{statusMeta.label.toUpperCase()}</span>
            <a
              href={buildWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors shadow-xs no-underline"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>

        {/* Acciones de flujo de estado */}
        <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Clock size={13} /> Gestión de Flujo del Pedido
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {currentNorm === 'PENDING' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleActionClick('PREPARING')}
                >
                  → Iniciar Preparación (Reservar Stock)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleActionClick('CANCELLED')}
                >
                  ✕ Cancelar Pedido
                </Button>
              </>
            )}

            {currentNorm === 'PREPARING' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleActionClick('SHIPPED')}
                >
                  🚚 Despachar Envío (Verifica Pago RN06)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleActionClick('CANCELLED')}
                >
                  ✕ Cancelar (Libera Reserva)
                </Button>
              </>
            )}

            {currentNorm === 'SHIPPED' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleActionClick('DELIVERED')}
                >
                  ✓ Marcar Entregado al Cliente
                </Button>
                <span className="text-[11px] text-gray-500 italic ml-2">
                  No se permite cancelación de pedidos despachados.
                </span>
              </>
            )}

            {currentNorm === 'DELIVERED' && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Pedido completado y entregado al cliente.
              </span>
            )}

            {currentNorm === 'CANCELLED' && (
              <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                <XCircle size={14} /> Pedido cancelado. Reservas liberadas en almacén.
              </span>
            )}
          </div>
        </div>

        {/* Datos del cliente y entrega */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-gray-200 space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-600 block flex items-center gap-1">
              <User size={13} /> Cliente
            </span>
            <div className="font-semibold text-gray-900 text-sm">{order.customerName}</div>
            <div className="text-gray-600 flex items-center gap-1">
              <Phone size={12} className="text-gray-400" /> {order.customerPhone || order.phone}
            </div>
            {order.notes && (
              <div className="text-gray-500 italic mt-1 pt-1 border-t border-gray-100">
                Nota: {order.notes}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl border border-gray-200 space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-600 block flex items-center gap-1">
              <MapPin size={13} /> Destino y Referencia
            </span>
            <div className="font-medium text-gray-900">{order.shippingAddress}</div>
            {order.reference && (
              <div className="text-gray-500 italic">Ref: {order.reference}</div>
            )}
          </div>
        </div>

        {/* Courier y seguimiento */}
        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-700 block flex items-center gap-1.5">
            <Truck size={14} /> Información de Envío ({order.courierCompany || order.courier || 'Por asignar'})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Guía / Seguimiento:</span>
              <div className="font-mono font-bold text-gray-900 mt-0.5">
                {order.trackingNumber || 'Sin número registrado'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Forma de Pago Solicitada:</span>
              <div className="font-semibold text-gray-900 mt-0.5">
                {order.requestedPaymentMethod || 'Yape / Plin / Transferencia'}
              </div>
            </div>

            {order.deliveryScope === 'LOCAL' && order.driverName && (
              <div className="col-span-full pt-1 border-t border-gray-200/60 mt-1 flex items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <Car size={13} /> {order.driverName}
                </span>
                {order.vehiclePlate && <span>Placa: {order.vehiclePlate}</span>}
                {order.driverPhone && <span>Tel: {order.driverPhone}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Lista de productos solicitados */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-2.5 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Package size={14} /> Productos en el Pedido
          </div>
          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {order.items && order.items.length > 0 ? (
              order.items.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{it.productName}</span>
                    <div className="text-gray-500 flex items-center gap-2 mt-0.5">
                      {it.sku && <span className="font-mono text-[11px] bg-gray-100 px-1 rounded">{it.sku}</span>}
                      {(it.color || it.size) && <span>{[it.color, it.size].filter(Boolean).join(' / ')}</span>}
                      <span>{it.quantity} unid. × {formatCurrency(it.unitPrice || it.price)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(it.subtotal || it.quantity * (it.unitPrice || it.price))}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-gray-400">
                Detalle de productos no disponible.
              </div>
            )}
          </div>
          <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs font-black text-gray-950">
            <div>
              <span>Subtotal: {formatCurrency(order.totalProducts || 0)}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>Envío: {formatCurrency(order.shippingCost || 0)}</span>
            </div>
            <span className="text-sm">Total: {formatCurrency(order.totalOrder != null ? order.totalOrder : order.total)}</span>
          </div>
        </div>

        {/* Historial de Auditoría de Estados */}
        {order.history && order.history.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <History size={13} /> Historial de Movimientos y Auditoría
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {order.history.map((h, idx) => (
                <div
                  key={h.id || idx}
                  className="text-xs p-2 rounded-lg bg-white border border-gray-200 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-gray-800">
                      {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Inicio: ${h.toStatus}`}
                    </span>
                    {h.changeReason && (
                      <p className="text-[11px] text-gray-500 m-0 mt-0.5">{h.changeReason}</p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-gray-400 shrink-0">
                    <div>{h.changedByName || 'Sistema'}</div>
                    <div>{formatDate(h.changedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
