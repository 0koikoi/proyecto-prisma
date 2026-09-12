/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Buscador Rápido de Productos (Cmd/Ctrl+K)
 *
 * Paleta de comandos headless (cmdk) para encontrar y agregar un producto al
 * ticket sin soltar el teclado. Complementa la búsqueda visual de ProductGrid
 * para un cajero que prefiere trabajar 100% con teclado (RNF02).
 *
 * cmdk no impone estilos propios: toda la apariencia usa las mismas clases
 * Tailwind/semánticas del resto del sistema (blanco/negro minimalista).
 */
import { useMemo } from 'react';
import { Command } from 'cmdk';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

export const QuickSearchPalette = ({ open, onOpenChange, products, onSelect }) => {
  const items = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        keywords: [p.sku, p.barcode, p.category].filter(Boolean),
      })),
    [products]
  );

  const handleSelect = (product) => {
    if (product.stock <= 0) return;
    onSelect(product);
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Buscador rápido de productos"
      shouldFilter
      loop
      overlayClassName="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50"
      contentClassName="fixed left-1/2 top-24 -translate-x-1/2 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
    >
      <div className="flex items-center gap-3 px-4 border-b border-gray-100">
        <Search size={16} className="text-gray-400 shrink-0" />
        <Command.Input
          autoFocus
          placeholder="Buscar producto por nombre, SKU o código de barras..."
          className="w-full h-12 border-none outline-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
        />
        <kbd className="hidden sm:inline text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
          ESC
        </kbd>
      </div>

      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-sm text-gray-500">
          No se encontraron productos.
        </Command.Empty>

        {items.map((p) => {
          const isOutOfStock = p.stock <= 0;
          return (
            <Command.Item
              key={p.id}
              value={p.name}
              keywords={p.keywords}
              disabled={isOutOfStock}
              onSelect={() => handleSelect(p)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer aria-selected:bg-gray-100 ${
                isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  <Package size={15} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                    <AlertTriangle size={10} /> Agotado
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900">{formatCurrency(p.price)}</span>
                )}
              </div>
            </Command.Item>
          );
        })}
      </Command.List>
    </Command.Dialog>
  );
};
