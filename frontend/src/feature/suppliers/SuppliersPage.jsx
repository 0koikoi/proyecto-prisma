/**
 * Directorio de proveedores
 * Contactos de talleres textiles y distribuidores.
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
import { useToast } from '../../core/context/ToastContext';

export const SuppliersPage = () => {
  const { showToast } = useToast();
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
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => showToast('Módulo de registro de proveedor en desarrollo.', 'info')}
        >
          Nuevo Proveedor
        </Button>
      </div>

      <div className="content-card p-0 overflow-hidden">
        <SuppliersTable suppliers={suppliers} />
      </div>
    </div>
  );
};
