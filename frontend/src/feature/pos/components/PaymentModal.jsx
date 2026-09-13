/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Modal de Cobro y Métodos de Pago
 *
 * Modal para seleccionar el medio de pago (Yape, Plin, Efectivo, Tarjeta),
 * calcular vuelto en efectivo y confirmar la venta.
 *
 * TODO Leo:
 *  - Enviar el ticket al backend e imprimir voucher o ticket digital si aplica.
 *  - Actualizar el estado de la caja sumando el monto al método correspondiente.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Banknote, Smartphone, CreditCard, CheckCircle } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, total, onConfirmSale }) => {
  const [method, setMethod] = useState('YAPE'); // 'EFECTIVO', 'YAPE', 'PLIN', 'TARJETA'
  const [cashGiven, setCashGiven] = useState('');

  const vuelto = method === 'EFECTIVO' && parseFloat(cashGiven) > total
    ? parseFloat(cashGiven) - total
    : 0;

  const handleConfirm = () => {
    onConfirmSale({
      paymentMethod: method,
      total,
      cashGiven: method === 'EFECTIVO' ? parseFloat(cashGiven) || total : total,
      vuelto,
    });
    onClose();
  };

  const paymentMethods = [
    { id: 'YAPE', name: 'Yape', icon: Smartphone, color: 'border-purple-200 hover:border-purple-400', active: 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600' },
    { id: 'PLIN', name: 'Plin', icon: Smartphone, color: 'border-cyan-200 hover:border-cyan-400', active: 'border-cyan-600 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-600' },
    { id: 'EFECTIVO', name: 'Efectivo', icon: Banknote, color: 'border-emerald-200 hover:border-emerald-400', active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600' },
    { id: 'TARJETA', name: 'Tarjeta', icon: CreditCard, color: 'border-blue-200 hover:border-blue-400', active: 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Procesar Cobro de Venta" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Banner de Total a Pagar */}
        <div className="bg-gray-950 text-white rounded-xl p-5 text-center shadow-inner">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Total a Pagar
          </span>
          <span className="text-3xl font-black tracking-tight text-white">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Selector de Medios de Pago */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
            Medio de Pago
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-colors cursor-pointer bg-white ${
                    isSelected ? m.active : `${m.color} text-gray-700 hover:bg-gray-50`
                  }`}
                  onClick={() => setMethod(m.id)}
                >
                  <Icon size={18} />
                  <span>{m.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sección de cálculo de vuelto en Efectivo */}
        <AnimatePresence initial={false}>
          {method === 'EFECTIVO' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700" htmlFor="cashGiven">
                    ¿Con cuánto paga el cliente? (S/)
                  </label>
                  <input
                    id="cashGiven"
                    type="number"
                    step="0.10"
                    placeholder={total.toString()}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-shadow"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 text-sm">
                  <span className="text-gray-600 font-medium">Vuelto a entregar:</span>
                  <span className={`text-base font-bold ${vuelto > 0 ? 'text-emerald-600 font-black' : 'text-gray-900'}`}>
                    {formatCurrency(vuelto)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" icon={CheckCircle} onClick={handleConfirm}>
            Confirmar y Emitir Ticket
          </Button>
        </div>
      </div>
    </Modal>
  );
};
