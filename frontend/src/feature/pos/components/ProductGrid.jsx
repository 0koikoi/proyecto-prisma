/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Catálogo Visual de Productos
 *
 * Muestra las tarjetas de los productos para selección rápida en mostrador.
 *
 * TODO Leo:
 *  - Indicar visualmente si el producto tiene stock bajo (<= 3 unidades).
 *  - Bloquear el clic si el producto está totalmente agotado (RF11).
 *  - Si se añade soporte para fotos reales de producto, mostrar img con fallback al icono Package.
 */
import { formatCurrency } from '../../../shared/utils/formatters';
import { Package, Plus, AlertTriangle } from 'lucide-react';

export const ProductGrid = ({ products, onSelectProduct }) => {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
          <Package size={28} />
        </div>
        <p className="text-sm font-semibold text-gray-800">No se encontraron productos</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Prueba cambiando de categoría o usando otros términos en el buscador rápido.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => {
        const isOutOfStock = p.stock <= 0;
        const isLowStock = p.stock > 0 && p.stock <= 3;

        return (
          <button
            key={p.id}
            type="button"
            className={`group relative bg-white border rounded-xl p-4 text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
              isOutOfStock
                ? 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-50'
                : 'border-gray-200 hover:border-gray-900 hover:shadow-md'
            }`}
            onClick={() => !isOutOfStock && onSelectProduct(p)}
            disabled={isOutOfStock}
          >
            <div>
              {/* Header de la tarjeta con categoría y stock badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {p.category}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                    Agotado
                  </span>
                ) : isLowStock ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                    <AlertTriangle size={10} /> {p.stock} disp.
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-500">
                    {p.stock} disp.
                  </span>
                )}
              </div>

              {/* Nombre y SKU */}
              <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-black">
                {p.name}
              </h4>
              <p className="text-xs font-mono text-gray-400 mb-3">
                SKU: {p.sku}
              </p>
            </div>

            {/* Precio y botón de agregar */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
              <span className="text-base font-black text-gray-950">
                {formatCurrency(p.price)}
              </span>

              {!isOutOfStock && (
                <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
