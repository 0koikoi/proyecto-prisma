/**
 * Modal para visualizar el detalle completo de un pedido, productos, courier y evidencia (RF17).
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
} from 'lucide-react';

export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const getWhatsAppUrl = () => {
    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const text = encodeURIComponent(
      `Hola ${order.customerName}, te saludamos de Tienda Prisma. Tu pedido #${order.id} se encuentra en estado: ${order.status}. Courier: ${order.courier} (${order.trackingNumber}). ¡Gracias por tu compra!`
    );
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle del Pedido: ${order.id}`} maxWidth="620px">
      <div className="space-y-4">
        {/* Cabecera resumen */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={13} /> Registrado el {formatDate(order.createdAt)}
            </div>
            <div className="text-xs font-semibold text-gray-800 mt-0.5">
              Canal: <span className="font-bold">{order.channel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs">{order.status}</span>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors shadow-xs no-underline"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
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
              <Phone size={12} className="text-gray-400" /> {order.phone}
            </div>
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
            <Truck size={14} /> Información de Envío ({order.courier})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Guía / Seguimiento:</span>
              <div className="font-mono font-bold text-gray-900 mt-0.5">
                {order.trackingNumber || 'Sin número registrado'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Forma de Pago:</span>
              <div className="font-semibold text-gray-900 mt-0.5">
                {order.paymentMethod || 'Pago confirmado'}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos solicitados */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-2.5 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Package size={14} /> Productos en el Pedido
          </div>
          <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
            {order.items && order.items.length > 0 ? (
              order.items.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{it.productName}</span>
                    <div className="text-gray-500">
                      {it.quantity} unid. × {formatCurrency(it.price)}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(it.subtotal || it.quantity * it.price)}
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
            <span>Total a Cobrar (con envío)</span>
            <span className="text-sm">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Evidencia de Envío (RF17) */}
        <div className="p-3 rounded-xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Camera size={14} /> Evidencia de Envío / Foto de Paquete (RF17)
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" /> Verificado por tienda
            </span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500 mb-1">
              <FileText size={18} />
            </div>
            <p className="text-xs font-medium text-gray-700 m-0">
              {order.courier === 'Comité 6'
                ? `Constancia Comité 6: Placa y chofer confirmados (${order.trackingNumber})`
                : `Comprobante de despacho registrado: ${order.trackingNumber}`}
            </p>
            <p className="text-[11px] text-gray-400 m-0 mt-0.5">
              Foto del paquete lista para reenvío al cliente vía WhatsApp.
            </p>
          </div>
        </div>

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
