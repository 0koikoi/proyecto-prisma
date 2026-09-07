/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Tabla de Productos
 *
 * Tabla con todos los productos del inventario.
 *
 * TODO Mauricio: Agregar columna "Código de Barras" cuando el campo esté en la entidad (RF06).
 * TODO Mauricio: Agregar columna "Costo (S/)" para mostrar el costPrice.
 * TODO Mauricio: Agregar columna "Proveedor" (nombre del supplier).
 * TODO Mauricio: Implementar paginación si hay muchos productos.
 */
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

export const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="custom-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Categoría</th>
            {/* TODO Mauricio: agregar <th>Costo</th> y <th>Proveedor</th> */}
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Estado</th>
            <th className="text-right pr-6">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-12 text-gray-400 text-sm">
                No hay productos que coincidan con la búsqueda.
              </td>
            </tr>
          ) : (
            products.map((p) => {
              const isOutOfStock = p.stock === 0;
              const isLowStock  = p.stock > 0 && p.stock <= 3;
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{p.sku}</code>
                    {p.barcode && (
                      <span className="text-[11px] text-gray-400 block font-mono mt-0.5">
                        EAN: {p.barcode}
                      </span>
                    )}
                  </td>
                  <td className="font-medium">{p.name}</td>
                  <td><span className="badge badge-neutral">{p.category}</span></td>
                  {/* TODO Mauricio: <td>{formatCurrency(p.costPrice)}</td> */}
                  <td className="font-semibold">{formatCurrency(p.price)}</td>
                  <td className={`font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-gray-900'}`}>
                    {p.stock} un.
                  </td>
                  <td>
                    {isOutOfStock ? (
                      <span className="badge badge-danger">Agotado</span>
                    ) : isLowStock ? (
                      <span className="badge badge-warning flex items-center gap-1">
                        <AlertTriangle size={12} /> Bajo stock
                      </span>
                    ) : (
                      <span className="badge badge-success">Disponible</span>
                    )}
                  </td>
                  <td className="text-right pr-6">
                    <button
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      onClick={() => onEdit(p)} title="Editar" type="button"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1"
                      onClick={() => onDelete(p.id)} title="Dar de baja" type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
