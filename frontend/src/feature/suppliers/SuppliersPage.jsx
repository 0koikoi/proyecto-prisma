/**
 * Directorio de proveedores
 * Contactos de talleres textiles y distribuidores.
 *
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Plus, PackagePlus, LayoutGrid, List, Search } from 'lucide-react';
import { suppliersService } from './services/suppliersService';
import { SuppliersTable } from './components/SuppliersTable';
import { SuppliersGrid } from './components/SuppliersGrid';
import { SupplierFormModal } from './components/SupplierFormModal';
import { RestockModal } from './components/RestockModal';
import { Button } from '../../shared/components/Button';
import { useToast } from '../../core/context/ToastContext';

export const SuppliersPage = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (tarjetas) | 'table' (tabla)

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

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.companyName && s.companyName.toLowerCase().includes(term)) ||
      (s.contactName && s.contactName.toLowerCase().includes(term)) ||
      (s.taxId && s.taxId.includes(term)) ||
      (s.productsSupplied && s.productsSupplied.toLowerCase().includes(term))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Directorio de Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Talleres de confección, distribuidores de moda y compras de reposición (RF18, RF19).
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

      {/* Barra de herramientas: Buscador y Selector de Vista (Tarjetas / Tabla) */}
      <div className="filters-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por taller, contacto o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 outline-none focus:ring-2 focus:ring-[#1c1c1c] shadow-xs"
          />
        </div>

        {/* Toggle conmutable: Cuadrícula de Tarjetas vs Tabla */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-400 font-medium mr-1 hidden sm:inline">
            {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'taller' : 'talleres'}
          </span>
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ease-out cursor-pointer border-none active:scale-95 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'bg-transparent text-gray-500 hover:text-gray-900'
              }`}
              title="Vista en tarjetas de presentación"
            >
              <LayoutGrid size={14} />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ease-out cursor-pointer border-none active:scale-95 ${
                viewMode === 'table'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'bg-transparent text-gray-500 hover:text-gray-900'
              }`}
              title="Vista en tabla"
            >
              <List size={14} />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado condicional según el modo seleccionado */}
      {viewMode === 'grid' ? (
        <SuppliersGrid
          suppliers={filteredSuppliers}
          onEdit={handleEditSupplier}
          onRestock={handleOpenRestock}
        />
      ) : (
        <div className="content-card p-0 overflow-hidden">
          <SuppliersTable
            suppliers={filteredSuppliers}
            onEdit={handleEditSupplier}
            onRestock={handleOpenRestock}
          />
        </div>
      )}

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
