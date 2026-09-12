/**
 * Directorio de proveedores y talleres.
 * Responsable: Zully
 */
import { Phone, Mail, FileText, Building2, PackagePlus, Pencil } from 'lucide-react';

export const SuppliersTable = ({ suppliers, onEdit, onRestock }) => {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>RAZÓN SOCIAL / TALLER</th>
            <th>CONTACTO</th>
            <th>TELÉFONO</th>
            <th>CORREO</th>
            <th>RUC / DNI</th>
            <th>LÍNEA DE SUMINISTRO</th>
            <th className="text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                No hay proveedores registrados en el directorio.
              </td>
            </tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <strong className="text-gray-900 font-semibold">{s.companyName}</strong>
                  </div>
                </td>
                <td className="text-gray-700 font-medium">{s.contactName}</td>
                <td>
                  <a
                    href={`tel:${s.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-950 no-underline font-medium"
                  >
                    <Phone size={13} className="text-gray-400" /> {s.phone}
                  </a>
                </td>
                <td>
                  {s.email ? (
                    <a
                      href={`mailto:${s.email}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-950 no-underline"
                    >
                      <Mail size={13} className="text-gray-400" /> {s.email}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    <FileText size={12} className="text-gray-500" /> {s.taxId || '-'}
                  </span>
                </td>
                <td>
                  <span className="badge badge-neutral text-xs">
                    {s.productsSupplied || 'General'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onRestock && onRestock(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer border-none"
                      title="Registrar reposición de stock para este proveedor"
                    >
                      <PackagePlus size={13} />
                      <span>Reponer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(s)}
                      className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-950 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Editar datos del proveedor"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
