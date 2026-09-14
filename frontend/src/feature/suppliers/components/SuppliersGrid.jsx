/**
 * Cuadrícula de tarjetas de presentación para proveedores y talleres.
 * Responsable: Zully
 */
import { SupplierCard } from './SupplierCard';
import { Building2 } from 'lucide-react';

export const SuppliersGrid = ({ suppliers = [], onEdit, onRestock }) => {
  if (suppliers.length === 0) {
    return (
      <div className="content-card text-center py-16">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <Building2 size={24} />
        </div>
        <h3 className="text-sm font-bold text-gray-800 m-0">No hay proveedores registrados</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          Comienza agregando talleres textiles de Gamarra o distribuidores de moda con el botón "Nuevo Proveedor".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {suppliers.map((s) => (
        <SupplierCard
          key={s.id}
          supplier={s}
          onEdit={onEdit}
          onRestock={onRestock}
        />
      ))}
    </div>
  );
};
