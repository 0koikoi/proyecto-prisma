/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Página principal del módulo de Inventario.
 * Aquí se muestra la tabla de productos con filtros y el botón de "Nuevo Producto".
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Barra de filtros: buscador de texto (nombre / SKU / código de barras) y selector de categoría
 *  2. Tabla de productos con columnas: SKU, Nombre, Categoría, Proveedor, Costo, Precio, Stock, Estado, Acciones
 *  3. Alerta visual para productos con stock bajo (badge "Bajo stock" o "Agotado")
 *  4. Modal de creación/edición de producto (ProductFormModal.jsx)
 *  5. Botón de dar de baja (soft delete: isActive = false)
 *
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/products?search=&categoryId=  → listar con filtros
 *  - POST /api/products                      → crear producto
 *  - PUT  /api/products/{id}                 → editar producto
 *  - DELETE /api/products/{id}               → dar de baja producto
 *
 * TODO Mauricio: Reemplazar el mock de inventoryService por la API real.
 * TODO Mauricio: El campo "costPrice" es obligatorio — coordinar con Meli para el reporte.
 * TODO Mauricio: Agregar soporte para imagen de producto (imageUrl).
 * TODO Mauricio: Agregar columna "Código de Barras" y campo en el formulario (RF06).
 */
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { inventoryService } from './services/inventoryService';
import { ProductTable } from './components/ProductTable';
import { ProductFormModal } from './components/ProductFormModal';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { useToast } from '../../core/context/ToastContext';

export const InventoryPage = () => {
  const { showToast } = useToast();
  const {
    products,
    categories,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    reload,
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await inventoryService.deleteProduct(id);
      await reload();
      showToast('Producto retirado del inventario activo.', 'success');
    } catch {
      showToast('Error al dar de baja el producto.', 'error');
    }
  };

  const handleSave = async (productData) => {
    try {
      if (selectedProduct) {
        await inventoryService.updateProduct(selectedProduct.id, productData);
        showToast('Producto actualizado correctamente.', 'success');
      } else {
        await inventoryService.createProduct(productData);
        showToast('Nuevo producto registrado con éxito.', 'success');
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      await reload();
    } catch {
      showToast('Error al guardar el producto.', 'error');
    }
  };

  return (
    <div className="page-container inventory-page">
      <div className="page-header">
        <div>
          <h1>Control de Inventario</h1>
          <p className="text-sm text-[color:var(--inv-text-primary)] mt-0.5">
            Catálogo unificado de productos — tienda física y tienda online.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate} disabled={loading}>
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          {/* TODO Mauricio: cargar las categorías dinámicamente desde la API */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white text-[color:var(--inv-text-primary)] outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="Femenina">Ropa Juvenil Femenina</option>
            <option value="Urbana">Ropa Urbana</option>
            <option value="Mascotas">Ropa de Mascotas</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="content-card p-0 overflow-hidden">
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        product={selectedProduct}
        categories={categories}
      />
    </div>
  );
};
