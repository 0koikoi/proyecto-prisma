import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';
import { isLowStock } from '../utils/inventory';
import { ProductImage } from './InventoryUI';

export const ProductTable = ({ products, onEdit, onDelete, disabled = false }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[950px] border-collapse text-left text-sm [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3">
      <thead className="border-b border-[var(--inv-color-primary)]/20 bg-white/35 text-[11px] tracking-wide uppercase">
        <tr><th>SKU / Código</th><th>Producto</th><th>Categoría</th><th className="text-right">Costo</th><th className="text-right">Precio venta</th><th className="text-right">Stock</th><th>Estado</th><th className="text-right">Acciones</th></tr>
      </thead>
      <tbody className="divide-y divide-[var(--inv-color-primary)]/10">
        {!products.length ? <tr><td colSpan={8} className="h-28 text-center">No hay productos que coincidan con los filtros.</td></tr> : products.map((product) => {
          const low = isLowStock(product);
          const empty = Number(product.stock) === 0;
          return <tr key={product.id} className={`transition-colors hover:bg-white/40 ${empty ? 'inv-stock-row--empty' : low ? 'inv-stock-row--low' : ''}`}>
            <td><code className="rounded border border-[var(--inv-color-primary)]/20 bg-white/40 px-1.5 py-0.5 text-xs">{product.sku}</code><span className="mt-1 block font-mono text-[11px]">{product.barcode}</span></td>
            <td><div className="flex items-center gap-3"><ProductImage src={product.imageUrl} name={product.name} /><div><p className="font-semibold">{product.name}</p><p className="max-w-64 truncate text-xs opacity-75">{product.description}</p></div></div></td>
            <td>{product.category}</td>
            <td className="text-right whitespace-nowrap tabular-nums">{formatCurrency(product.costPrice)}</td>
            <td className="text-right font-semibold whitespace-nowrap tabular-nums">{formatCurrency(product.price)}</td>
            <td className="text-right font-bold whitespace-nowrap tabular-nums">{product.stock} un.</td>
            <td>
              <span className={`inv-stock-badge ${empty ? 'inv-stock-badge--empty' : low ? 'inv-stock-badge--low' : 'inv-stock-badge--available'}`}>
                {empty ? 'Sin stock' : low ? 'Bajo stock' : 'Disponible'}
              </span>
            </td>
            <td><div className="flex justify-end gap-1">
              <button disabled={disabled} className="rounded p-2 hover:bg-[var(--inv-color-primary)]/10 disabled:opacity-40" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`} title="Editar" type="button"><Edit size={15} /></button>
              <button disabled={disabled} className="rounded p-2 hover:bg-[var(--inv-color-primary)] hover:text-white disabled:opacity-40" onClick={() => onDelete(product.id)} aria-label={`Dar de baja ${product.name}`} title="Dar de baja" type="button"><Trash2 size={15} /></button>
            </div></td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>
);
