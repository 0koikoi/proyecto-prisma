/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Ticket Virtual
 *
 * Panel lateral del carrito de venta.
 * Permite ajustar cantidades, eliminar productos y calcular el subtotal en tiempo real.
 * Las filas usan `motion`/`AnimatePresence` para que agregar o quitar un producto
 * se sienta inmediato y no como un salto brusco de layout (RNF02).
 *
 * TODO Leo:
 *  - Agregar campo para descuento manual o porcentaje si el cliente lo solicita.
 */
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Button } from '../../../shared/components/Button';

export const CartTicket = ({
  cart,
  subtotal,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-[calc(100vh-140px)] shadow-sm sticky top-20">
      {/* Cabecera del ticket */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <ShoppingBag size={20} className="text-gray-700" />
          <h3 className="text-base font-semibold m-0">Ticket de Venta</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium ml-1">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        {cart.length > 0 && (
          <button
            className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer border-none bg-transparent hover:underline"
            onClick={onClear}
            type="button"
          >
            Vaciar todo
          </button>
        )}
      </div>

      {/* Lista de productos en el ticket */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <ShoppingBag size={48} className="stroke-[1.2] mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">El carrito está vacío</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Selecciona productos del catálogo o usa el escáner de código de barras.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, height: 0, marginTop: 0, paddingTop: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="pt-3 first:pt-0 flex items-center justify-between gap-3 overflow-hidden"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)} c/u &bull; SKU: <span className="font-mono text-gray-600">{item.sku}</span>
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
                      title="Disminuir"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center text-xs font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
                      title="Aumentar"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                    title="Eliminar artículo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pie del ticket / Totales y Cobro */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl space-y-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Subtotal:</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-base font-bold text-gray-950 pt-2 border-t border-gray-200">
          <span>TOTAL A COBRAR:</span>
          <motion.span
            key={subtotal}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xl text-gray-950 font-black"
          >
            {formatCurrency(subtotal)}
          </motion.span>
        </div>

        <motion.div whileTap={cart.length > 0 ? { scale: 0.98 } : undefined}>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2 font-bold shadow-sm"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Cobrar Venta ({formatCurrency(subtotal)})
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
