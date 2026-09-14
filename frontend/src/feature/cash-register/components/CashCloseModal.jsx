/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Cierre y Cuadre de Caja
 *
 * Modal para finalizar el turno diario.
 * Compara el efectivo esperado en el sistema con el efectivo contado físicamente
 * para detectar descuadres (faltantes o sobrantes) — RF14.
 *
 * VALIDACIÓN (react-hook-form + zod):
 *  - El efectivo contado debe ser un número >= 0.
 *  - Si el FALTANTE supera el margen de tolerancia (SIGNIFICANT_THRESHOLD), las
 *    observaciones pasan a ser obligatorias — antes cualquier descuadre, grande
 *    o mínimo, se veía y trataba exactamente igual.
 *  - `watch()` mantiene el cálculo reactivo del descuadre mientras se escribe.
 *
 * CALCULADORA DE BILLETES Y MONEDAS: panel opcional para desglosar el conteo
 * físico por denominación (soles) y volcar el total directo al campo de
 * efectivo contado, en vez de sumar todo de cabeza en el mostrador.
 *
 * TODO Leo:
 *  - Conectar con cashService.closeRegister(data).
 *  - Enviar registro a la tabla cash_registers de PostgreSQL.
 */
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { AlertCircle, CheckCircle2, Calculator, ChevronDown } from 'lucide-react';

const SIGNIFICANT_THRESHOLD = 5; // S/ — faltante por encima de esto exige justificación
const BILLS = [200, 100, 50, 20, 10];
const COINS = [5, 2, 1, 0.5, 0.2, 0.1];

export const CashCloseModal = ({ isOpen, onClose, onConfirm, expectedTotal }) => {
  const schema = z
    .object({
      // transform manual con parseFloat en vez de z.coerce.number(): así el
      // único mensaje de error es el nuestro. z.coerce.number() coercionaba
      // '' a 0 en silencio (Number('') === 0) y reportaba un "faltante" que
      // en realidad era solo un campo sin completar.
      countedCash: z
        .union([z.string(), z.number()])
        .transform((v) => parseFloat(v))
        .refine((v) => !Number.isNaN(v) && v >= 0, { message: 'Ingresa el efectivo contado (0 o más)' }),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const diff = data.countedCash - (expectedTotal || 0);
      if (diff < 0 && Math.abs(diff) > SIGNIFICANT_THRESHOLD && !data.notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['notes'],
          message: `Debes justificar un faltante mayor a ${formatCurrency(SIGNIFICANT_THRESHOLD)}.`,
        });
      }
    });

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { countedCash: '', notes: '' },
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [denomCounts, setDenomCounts] = useState({});

  const countedCashRaw = watch('countedCash');
  const hasCountedValue = countedCashRaw !== '' && countedCashRaw !== undefined;
  const countedCashNum = parseFloat(countedCashRaw);
  const difference = (Number.isNaN(countedCashNum) ? 0 : countedCashNum) - (expectedTotal || 0);
  const isSignificantShortage = difference < 0 && Math.abs(difference) > SIGNIFICANT_THRESHOLD;

  const denomTotal = [...BILLS, ...COINS].reduce(
    (acc, denom) => acc + denom * (parseInt(denomCounts[denom], 10) || 0),
    0
  );

  const handleDenomChange = (denom, value) => {
    setDenomCounts((prev) => ({ ...prev, [denom]: value }));
  };

  const useCalculatorTotal = () => {
    setValue('countedCash', denomTotal.toFixed(2), { shouldValidate: true });
  };

  const submit = (data) => {
    onConfirm({
      countedCash: data.countedCash,
      difference,
      notes: data.notes || '',
    });
    reset({ countedCash: '', notes: '' });
    setDenomCounts({});
    setShowCalculator(false);
    onClose();
  };

  // maxWidth de Modal.jsx es un valor CSS (style inline), no una clase de
  // Tailwind — "max-w-md" se ignoraba y dejaba el modal casi a pantalla completa.
  // max-h-[70vh]+overflow-y-auto: este modal es el más largo del sistema (banner +
  // calculadora + indicador + observaciones), así que es el que más se beneficia
  // del límite de alto para nunca desbordar la pantalla.
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cierre de Caja y Arqueo Físico" maxWidth="28rem">
      {/* noValidate: apagamos la validación nativa del navegador (el globito
          "Completa este campo") — zod + react-hook-form ya muestran sus
          propios mensajes de error, tener las dos a la vez se veía mal. */}
      <form onSubmit={handleSubmit(submit)} noValidate className="max-h-[70vh] overflow-y-auto pr-0.5 space-y-4">
        {/* Banner de efectivo esperado — gris claro, igual al "Total a Pagar"
            del POS, en vez del negro puro que quedaba muy pesado junto a los
            botones de abajo */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs uppercase text-gray-500 font-bold block">
              Efectivo Esperado en Gaveta
            </span>
            <span className="text-xs text-gray-400 block">Sencillo inicial + ventas efectivo</span>
          </div>
          <strong className="text-2xl font-black text-gray-950 shrink-0">
            {formatCurrency(expectedTotal)}
          </strong>
        </div>

        <Controller
          name="countedCash"
          control={control}
          render={({ field }) => (
            <Input
              label="Efectivo Físico Contado en Gaveta (S/)"
              type="number"
              step="0.10"
              placeholder="0.00"
              value={field.value}
              onChange={field.onChange}
              error={errors.countedCash?.message}
              required
            />
          )}
        />

        {/* Calculadora de billetes y monedas */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCalculator((v) => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 text-sm font-semibold text-gray-700 cursor-pointer border-none"
          >
            <span className="flex items-center gap-2">
              <Calculator size={15} />
              Calculadora de billetes y monedas
            </span>
            <ChevronDown size={16} className={`transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showCalculator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Billetes</p>
                    <div className="grid grid-cols-3 gap-2">
                      {BILLS.map((denom) => (
                        <div key={denom} className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-gray-600 w-11 shrink-0">S/{denom}</span>
                          <input
                            type="number"
                            min="0"
                            value={denomCounts[denom] || ''}
                            onChange={(e) => handleDenomChange(denom, e.target.value)}
                            placeholder="0"
                            className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Monedas</p>
                    <div className="grid grid-cols-3 gap-2">
                      {COINS.map((denom) => (
                        <div key={denom} className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-gray-600 w-11 shrink-0">S/{denom}</span>
                          <input
                            type="number"
                            min="0"
                            value={denomCounts[denom] || ''}
                            onChange={(e) => handleDenomChange(denom, e.target.value)}
                            placeholder="0"
                            className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                    <span className="text-sm font-semibold text-gray-700">
                      Total contado: <span className="font-mono">{formatCurrency(denomTotal)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={useCalculatorTotal}
                      disabled={denomTotal === 0}
                      className="h-8 px-3 rounded-md bg-gray-900 text-white text-xs font-bold cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Usar este monto
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Indicador de Descuadre */}
        <AnimatePresence initial={false}>
          {hasCountedValue && (
            <motion.div
              key={difference === 0 ? 'ok' : isSignificantShortage ? 'short-big' : difference < 0 ? 'short' : 'over'}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
                difference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isSignificantShortage
                  ? 'bg-red-600 border-red-700 text-white'
                  : difference < 0
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {difference === 0 ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={18} className={isSignificantShortage ? 'text-white' : difference < 0 ? 'text-red-600' : 'text-amber-600'} />
                )}
                <span>
                  {difference === 0
                    ? 'Cuadre Perfecto'
                    : isSignificantShortage
                    ? 'Faltante Importante — requiere justificación'
                    : difference < 0
                    ? 'Faltante de Caja'
                    : 'Sobrante de Caja'}
                </span>
              </div>
              <span className="font-bold text-base shrink-0">
                {formatCurrency(Math.abs(difference))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Observaciones */}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="notes">
                Observaciones / Justificación de Descuadre{isSignificantShortage && <span className="text-red-500 ml-0.5">*</span>}:
              </label>
              <textarea
                id="notes"
                rows="2"
                value={field.value}
                onChange={field.onChange}
                placeholder="Opcional: detalles sobre gastos imprevistos, sencillo, etc."
                className={`w-full p-2.5 bg-white border rounded-lg text-sm text-gray-900 outline-none focus:ring-2 resize-none transition-shadow ${
                  errors.notes ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                }`}
              />
              {errors.notes && <span className="text-xs text-red-500">{errors.notes.message}</span>}
            </div>
          )}
        />

        {/* Acciones — tamaño normal (md) y "primary" en vez de "danger": el
            rojo se sentía como una alerta de error, cuando cerrar turno es
            una acción normal del día a día, no algo destructivo */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="w-full">
            Cerrar Caja
          </Button>
        </div>
      </form>
    </Modal>
  );
};
