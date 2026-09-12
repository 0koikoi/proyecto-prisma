/**
 * Directorio de proveedores
 * Contactos de talleres textiles y distribuidores.
 *
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Plus, PackagePlus } from 'lucide-react';
import { suppliersService } from './services/suppliersService';
import { SuppliersTable } from './components/SuppliersTable';
import { SupplierFormModal } from './components/SupplierFormModal';
import { RestockModal } from './components/RestockModal';
import { Button } from '../../shared/components/Button';
import { useToast } from '../../core/context/ToastContext';

export const SuppliersPage = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedSupplierForRestock, setSelectedSupplierForRestock] = useState(null);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersService.getSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      showToast('Error al cargar proveedores.', 'error');
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenNewSupplier = () => {
    setSupplierToEdit(null);
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSupplierToEdit(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (supplierData) => {
    try {
      if (supplierToEdit) {
        await suppliersService.updateSupplier(supplierToEdit.id, supplierData);
        showToast('Datos del proveedor actualizados.', 'success');
      } else {
        await suppliersService.createSupplier(supplierData);
        showToast('Nuevo proveedor registrado con éxito.', 'success');
      }
      setIsSupplierModalOpen(false);
      setSupplierToEdit(null);
      loadSuppliers();
    } catch (err) {
      showToast('Error al guardar el proveedor.', 'error');
    }
  };

  const handleOpenRestock = (supplier = null) => {
    setSelectedSupplierForRestock(supplier);
    setIsRestockModalOpen(true);
  };

  const handleSaveRestock = async (restockData) => {
    try {
      await suppliersService.registerRestock(restockData);
      setIsRestockModalOpen(false);
      setSelectedSupplierForRestock(null);
      showToast(
        `Reposición de ${restockData.quantity} unid. (${restockData.productName}) registrada correctamente.`,
        'success'
      );
    } catch (err) {
      showToast('Error al registrar la reposición.', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Directorio de Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contactos de talleres textiles, distribuidores y compras de mercadería (RF18, RF19).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={PackagePlus}
            onClick={() => handleOpenRestock(null)}
          >
            Reponer Stock
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenNewSupplier}
          >
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      <div className="content-card p-0 overflow-hidden">
        <SuppliersTable
          suppliers={suppliers}
          onEdit={handleEditSupplier}
          onRestock={handleOpenRestock}
        />
      </div>

      {/* Modal para crear o editar proveedor */}
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSupplierToEdit(null);
        }}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />

      {/* Modal de reposición de mercadería (RF19) */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedSupplierForRestock(null);
        }}
        onSave={handleSaveRestock}
        suppliers={suppliers}
        initialSupplier={selectedSupplierForRestock}
      />
    </div>
  );
};
