/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Comprobante / Ticket Imprimible
 *
 * Se muestra justo después de confirmar una venta (PLAN_FRONTEND_FASE_INDIVIDUAL,
 * punto 2 de Leo): un ticket con formato de ticketera térmica (80mm) y un botón
 * para imprimirlo con `window.print()`.
 *
 * CÓMO FUNCIONA LA IMPRESIÓN:
 *  - No se usa ninguna librería: es la técnica estándar de "print area" con CSS.
 *  - El `<style>` inyectado (con `@media print`) oculta todo el `<body>` excepto
 *    el contenedor del ticket (id="pos-ticket-print-area") mientras se imprime,
 *    y fija su ancho a 80mm imitando el papel de una ticketera térmica real.
 *  - Al cerrar este modal, React desmonta el `<style>` y todo vuelve a la
 *    normalidad — no afecta la impresión de ninguna otra pantalla del sistema.
 */
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', YAPE: 'Yape', PLIN: 'Plin', TARJETA: 'Tarjeta' };

export const TicketReceiptModal = ({ isOpen, onClose, receipt }) => {
  const show = isOpen && !!receipt;

  return (
    <AnimatePresence>
      {show && (
        <div id="pos-ticket-print-portal" key="ticket-receipt">
          <style>{`
            @media print {
              body > *:not(#pos-ticket-print-portal) { display: none !important; }
              #pos-ticket-print-portal { display: block !important; position: static !important; }
              #pos-ticket-print-area {
                width: 80mm;
                margin: 0;
                box-shadow: none !important;
                border: none !important;
              }
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              {/* Encabezado (no se imprime) */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 print:hidden">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Venta registrada</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Área imprimible: estilo de ticketera térmica 80mm */}
              <div id="pos-ticket-print-area" className="p-5 font-mono text-[13px] text-gray-900 leading-relaxed">
                <div className="text-center mb-2">
                  <p className="font-bold text-sm">TIENDA PRISMA</p>
                  <p className="text-[11px] text-gray-500">Ropa juvenil · Urbana · Mascotas</p>
                  <p className="text-[11px] text-gray-500">Huánuco, Perú</p>
                </div>

                <div className="border-t border-dashed border-gray-400 my-2" />

                <p>Ticket: #{receipt.ticketNumber}</p>
                <p>Fecha: {formatDate(receipt.createdAt)}</p>

                <div className="border-t border-dashed border-gray-400 my-2" />

                {receipt.items.map((item) => (
                  <div key={item.id} className="mb-1.5">
                    <p className="truncate">{item.name}</p>
                    <div className="flex justify-between text-gray-700">
                      <span>{item.quantity} x {formatCurrency(item.price)}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-dashed border-gray-400 my-2" />

                {receipt.discount ? (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(receipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento{receipt.discount.type === 'PERCENT' ? ` (${receipt.discount.value}%)` : ''}</span>
                      <span>-{formatCurrency(receipt.discountAmount)}</span>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span>
                  <span>{formatCurrency(receipt.total ?? receipt.subtotal)}</span>
                </div>

                <div className="border-t border-dashed border-gray-400 my-2" />

                <p>Método de pago: {PAYMENT_LABELS[receipt.paymentMethod] || receipt.paymentMethod}</p>
                {receipt.paymentMethod === 'EFECTIVO' && (
                  <>
                    <div className="flex justify-between">
                      <span>Recibido:</span>
                      <span>{formatCurrency(receipt.cashGiven)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vuelto:</span>
                      <span>{formatCurrency(receipt.vuelto)}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-dashed border-gray-400 my-2" />

                <p className="text-center text-[11px] mt-2">¡Gracias por su compra!</p>
              </div>

              {/* Acciones (no se imprimen) */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 print:hidden">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 h-10 rounded-lg bg-gray-950 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
