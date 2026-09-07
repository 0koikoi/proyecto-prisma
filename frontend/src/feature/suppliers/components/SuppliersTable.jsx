/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores — Tabla de Directorio
 *
 * Muestra el directorio de talleres de confección y distribuidores de mercadería.
 *
 * TODO Zully:
 *  - Conectar con suppliersService.getSuppliers() para listar desde PostgreSQL.
 *  - Agregar acción para registrar compra/reposición de stock asociada a un proveedor (RF19).
 *  - Agregar opción para editar datos de contacto o notas de abastecimiento.
 */
import { Phone, Mail, FileText, Building2 } from 'lucide-react';

export const SuppliersTable = ({ suppliers }) => {
  return (
    <div className="overflow-x-auto">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Razón Social / Taller</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>RUC / DNI</th>
            <th>Línea de Suministro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {suppliers.map((s) => (
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
                <a
                  href={`mailto:${s.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-950 no-underline"
                >
                  <Mail size={13} className="text-gray-400" /> {s.email}
                </a>
              </td>
              <td>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  <FileText size={12} className="text-gray-500" /> {s.taxId}
                </span>
              </td>
              <td>
                <span className="badge badge-neutral text-xs">
                  {s.productsSupplied}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
