/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores
 *
 * Página del directorio de proveedores de Tienda Prisma.
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Tabla de proveedores con datos de contacto (razón social, contacto, teléfono, RUC)
 *  2. Botón "Nuevo Proveedor" → formulario CRUD de proveedor
 *  3. Vista de detalle de proveedor → historial de reposiciones de stock
 *  4. Botón "Registrar Reposición" dentro del detalle del proveedor
 *
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/suppliers                        → listar proveedores
 *  - POST /api/suppliers                        → crear proveedor
 *  - PUT  /api/suppliers/{id}                   → editar proveedor
 *  - GET  /api/suppliers/{id}/purchases         → historial de reposiciones
 *  - POST /api/suppliers/{id}/purchases         → registrar reposición de stock
 *    (Al registrar: actualiza el stock de los productos + crea InventoryMovement)
 *
 * TODO Zully: Conectar la tabla con GET /api/suppliers.
 * TODO Zully: Implementar el formulario de nuevo proveedor (RF18).
 * TODO Zully: Implementar el formulario de reposición de stock (RF19).
 *             Coordinar con Mauricio: el backend de reposición también debe
 *             actualizar Product.currentStock y crear InventoryMovement.
 */
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { suppliersService } from './services/suppliersService';
import { SuppliersTable } from './components/SuppliersTable';
import { Button } from '../../shared/components/Button';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    // TODO Zully: reemplazar con la llamada real a GET /api/suppliers
    suppliersService.getSuppliers().then(setSuppliers);
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Directorio de Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contactos de talleres textiles, distribuidores y fabricantes de Tienda Prisma.
          </p>
        </div>
        {/* TODO Zully: abrir modal de formulario de nuevo proveedor */}
        <Button variant="primary" icon={Plus} onClick={() => alert('Abrir formulario de nuevo proveedor')}>
          Nuevo Proveedor
        </Button>
      </div>

      <div className="content-card p-0 overflow-hidden">
        <SuppliersTable suppliers={suppliers} />
      </div>
    </div>
  );
};
