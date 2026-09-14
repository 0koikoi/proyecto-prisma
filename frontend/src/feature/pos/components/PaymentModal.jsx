/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Modal de Cobro y Métodos de Pago
 *
 * Modal para seleccionar el medio de pago (Yape, Plin, Efectivo, Tarjeta),
 * calcular vuelto en efectivo y confirmar la venta.
 *
 * DISEÑO DEL SELECTOR DE MÉTODO: lista vertical (mejor objetivo táctil que una
 * grilla 2x2, más fácil de escanear con la vista en mostrador) con el ícono en
 * un círculo de color propio de cada medio de pago (Yape/Plin con QrCode —
 * así se paga realmente con ambos: mostrando/escaneando un QR — Efectivo con
 * Banknote, Tarjeta con CreditCard). El fondo de la fila seleccionada usa un
 * `layoutId` de motion: no aparece/desaparece, se *desliza* de una fila a otra
 * cuando el cajero cambia de método, igual que un selector "pill" animado.
 * Solo tonos pasteles de la paleta (fondos 50/100, texto 600) — sin degradados
 * ni sombras de color, para mantener el estilo del resto del sistema.
 *
 * El formulario tiene `max-h-[70vh] overflow-y-auto` propio para que el modal
 * nunca exceda el alto de la pantalla (Modal.jsx no define un límite propio).
 *
 * VALIDACIÓN (react-hook-form + zod):
 *  - Si el método es EFECTIVO, el monto entregado por el cliente debe ser
 *    al menos el total a pagar (antes se podía confirmar la venta con un
 *    monto insuficiente sin ningún aviso — el vuelto simplemente quedaba en 0).
 *  - Al elegir Efectivo, el campo se precarga con el total exacto (vuelto 0)
 *    para no obligar a tipear si el cliente paga justo.
 *
 * TODO Leo:
 *  - Enviar el ticket al backend e imprimir voucher o ticket digital si aplica.
 *  - Actualizar el estado de la caja sumando el monto al método correspondiente.
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Banknote, QrCode, CreditCard, CheckCircle, CheckCircle2 } from 'lucide-react';

const paymentMethods = [
  {
    id: 'YAPE',
    name: 'Yape',
    hint: 'Paga escaneando el QR',
    icon: QrCode,
    accent: 'bg-purple-400',
    activeBg: 'bg-purple-50',
    activeText: 'text-purple-900',
    iconIdle: 'bg-purple-50 text-purple-500',
    iconActive: 'bg-purple-100 text-purple-600',
    check: 'text-purple-600',
  },
  {
    id: 'PLIN',
    name: 'Plin',
    hint: 'Paga escaneando el QR',
    icon: QrCode,
    accent: 'bg-cyan-400',
    activeBg: 'bg-cyan-50',
    activeText: 'text-cyan-900',
    iconIdle: 'bg-cyan-50 text-cyan-500',
    iconActive: 'bg-cyan-100 text-cyan-600',
    check: 'text-cyan-600',
  },
  {
    id: 'EFECTIVO',
    name: 'Efectivo',
    hint: 'Pago en billetes/monedas',
    icon: Banknote,
    accent: 'bg-emerald-400',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-900',
    iconIdle: 'bg-emerald-50 text-emerald-500',
    iconActive: 'bg-emerald-100 text-emerald-600',
    check: 'text-emerald-600',
  },
  {
    id: 'TARJETA',
    name: 'Tarjeta',
    hint: 'Débito o crédito',
    icon: CreditCard,
    accent: 'bg-blue-400',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-900',
    iconIdle: 'bg-blue-50 text-blue-500',
    iconActive: 'bg-blue-100 text-blue-600',
    check: 'text-blue-600',
  },
];

export const PaymentModal = ({ isOpen, onClose, total, onConfirmSale }) => {
  const schema = z
    .object({
      method: z.enum(['YAPE', 'PLIN', 'EFECTIVO', 'TARJETA']),
      cashGiven: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.method === 'EFECTIVO') {
        const val = parseFloat(data.cashGiven);
        if (Number.isNaN(val) || val < total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cashGiven'],
            message: `Debe ser al menos ${formatCurrency(total)}`,
          });
        }
      }
    });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { method: 'YAPE', cashGiven: '' },
  });

  const method = watch('method');
  const cashGivenRaw = watch('cashGiven');
  const cashGivenNum = parseFloat(cashGivenRaw);
  const vuelto = method === 'EFECTIVO' && cashGivenNum > total ? cashGivenNum - total : 0;

  // Al abrir el modal o cambiar el total, reinicia el formulario con el total exacto precargado
  useEffect(() => {
    if (isOpen) {
      reset({ method: 'YAPE', cashGiven: total.toFixed(2) });
    }
  }, [isOpen, total, reset]);

  const submit = (data) => {
    const finalCashGiven = data.method === 'EFECTIVO' ? parseFloat(data.cashGiven) : total;
    onConfirmSale({
      paymentMethod: data.method,
      total,
      cashGiven: finalCashGiven,
      vuelto,
    });
    onClose();
  };

  // maxWidth de Modal.jsx es un valor CSS aplicado por style inline, no una
  // clase de Tailwind — "max-w-md" se ignoraba silenciosamente y dejaba el
  // modal sin límite de ancho real (casi pantalla completa).
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Procesar Cobro de Venta" maxWidth="28rem">
      {/* noValidate: apagamos la validación nativa del navegador (el globito
          "Completa este campo") — zod + react-hook-form ya muestran sus
          propios mensajes de error, tener las dos a la vez se veía mal. */}
      <form onSubmit={handleSubmit(submit)} noValidate className="max-h-[70vh] overflow-y-auto pr-0.5 space-y-4">
        {/* Total a Pagar — ocupa todo el ancho del modal. Gris neutro (no celeste)
            para no repetir el mismo color que ya usa el botón "Cancelar" del
            sistema compartido de botones (btn-secondary es celeste por diseño). */}
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gray-50 py-4">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-0.5">
            Total a Pagar
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={total}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="text-3xl font-black tracking-tight text-gray-950"
            >
              {formatCurrency(total)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selector de Medios de Pago — tarjetas con barra de acento deslizante */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
            Medio de Pago
          </label>
          <div className="flex flex-col gap-2">
            {paymentMethods.map((m, i) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 420, damping: 30 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl border text-left cursor-pointer overflow-hidden bg-white transition-colors ${
                    isSelected ? 'border-transparent' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('method', m.id, { shouldValidate: true })}
                >
                  {/* Barra de acento que se desliza entre filas al cambiar de método */}
                  {isSelected && (
                    <motion.span
                      layoutId="paymentMethodAccent"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      className={`absolute left-0 top-0 bottom-0 w-1 ${m.accent}`}
                    />
                  )}
                  {isSelected && (
                    <motion.span
                      layoutId="paymentMethodTint"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      className={`absolute inset-0 ${m.activeBg}`}
                    />
                  )}

                  <span
                    className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? m.iconActive : m.iconIdle
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="relative z-10 min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${isSelected ? m.activeText : 'text-gray-800'}`}>
                      {m.name}
                    </span>
                    <span className="block text-[11px] text-gray-500 truncate">{m.hint}</span>
                  </span>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className={`relative z-10 shrink-0 ${m.check}`}
                      >
                        <CheckCircle2 size={18} />
                      </motion.span>
                    )}
                  </AnimatePresence>
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
                  <Controller
                    name="cashGiven"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="cashGiven"
                        type="number"
                        step="0.10"
                        placeholder={total.toString()}
                        className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-gray-900 outline-none focus:ring-2 transition-shadow ${
                          errors.cashGiven
                            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                            : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                        }`}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.cashGiven && (
                    <span className="text-xs text-red-500">{errors.cashGiven.message}</span>
                  )}
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

        {/* Botones de acción — misma proporción, ocupan todo el ancho del modal */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle} className="w-full">
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
