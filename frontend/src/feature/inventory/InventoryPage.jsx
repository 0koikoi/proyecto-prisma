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
import { ProductTable } from './components/ProductTable';
import { ProductFormModal } from './components/ProductFormModal';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';

export const InventoryPage = () => {
  const {
    products,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
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

  const handleDelete = (id) => {
    // TODO Mauricio: llamar a inventoryService.deleteProduct(id) y recargar la lista
    if (window.confirm('¿Dar de baja este producto? Seguirá en el historial.')) {
      alert(`Producto ${id} dado de baja (implementar llamada a API)`);
    }
  };

  const handleSave = (productData) => {
    // TODO Mauricio: llamar a inventoryService.createProduct() o updateProduct()
    alert(`Guardado: ${productData.name} (implementar llamada a API)`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Control de Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Catálogo unificado de productos — tienda física y tienda online.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
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
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
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
      />
    </div>
  );
};
