/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Cierre y Cuadre de Caja
 *
 * Modal para finalizar el turno diario.
 * Compara el efectivo esperado en el sistema con el efectivo contado físicamente
 * para detectar descuadres (faltantes o sobrantes) — RF14.
 *
 * TODO Leo:
 *  - Conectar con cashService.closeRegister(data).
 *  - Enviar registro a la tabla cash_registers de PostgreSQL.
 *  - Mostrar alerta si hay faltante superior al margen de tolerancia.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

export const CashCloseModal = ({ isOpen, onClose, onConfirm, expectedTotal }) => {
  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');

  const difference = (parseFloat(countedCash) || 0) - (expectedTotal || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      countedCash: parseFloat(countedCash) || 0,
      difference,
      notes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cierre de Caja y Arqueo Físico" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner de efectivo esperado */}
        <div className="bg-gray-950 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-gray-400 font-semibold block">
              Efectivo Esperado en Gaveta
            </span>
            <span className="text-xs text-gray-500">(Sencillo inicial + Ventas efectivo)</span>
          </div>
          <strong className="text-2xl font-black text-white">
            {formatCurrency(expectedTotal)}
          </strong>
        </div>

        <Input
          label="Efectivo Físico Contado en Gaveta (S/)"
          type="number"
          step="0.10"
          placeholder="0.00"
          value={countedCash}
          onChange={(e) => setCountedCash(e.target.value)}
          required
        />

        {/* Indicador de Descuadre */}
        <AnimatePresence initial={false}>
          {countedCash !== '' && (
            <motion.div
              key={difference === 0 ? 'ok' : difference < 0 ? 'short' : 'over'}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
                difference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : difference < 0
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {difference === 0 ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={18} className={difference < 0 ? 'text-red-600' : 'text-amber-600'} />
                )}
                <span>
                  {difference === 0
                    ? 'Cuadre Perfecto'
                    : difference < 0
                    ? 'Faltante de Caja'
                    : 'Sobrante de Caja'}
                </span>
              </div>
              <span className="font-mono font-bold text-base">
                {formatCurrency(Math.abs(difference))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Observaciones */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700" htmlFor="notes">
            Observaciones / Justificación de Descuadre:
          </label>
          <textarea
            id="notes"
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional: detalles sobre gastos imprevistos, sencillo, etc."
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none transition-shadow"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger">
            Finalizar Turno y Cerrar Caja
          </Button>
        </div>
      </form>
    </Modal>
  );
};
