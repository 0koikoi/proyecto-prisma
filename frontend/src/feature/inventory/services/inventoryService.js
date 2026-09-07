/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Servicios de Datos
 *
 * Conecta el módulo de inventario con los endpoints REST del backend (Spring Boot).
 * Mientras el backend no esté desplegado, entrega datos mock con la misma estructura.
 *
 * ENDPOINTS ASOCIADOS (Sprint 6):
 *  - GET    /api/products           -> Lista productos activos
 *  - GET    /api/products/{id}      -> Detalle de producto
 *  - POST   /api/products           -> Crear producto (con SKU, barcode, costPrice, etc.)
 *  - PUT    /api/products/{id}      -> Actualizar producto
 *  - DELETE /api/products/{id}      -> Baja lógica de producto
 *  - GET    /api/categories         -> Catálogo de categorías (Femenina, Urbana, Mascotas)
 *
 * TODO Mauricio:
 *  - Reemplazar las respuestas mock por apiClient.<metodo>('/products...') al conectar con Spring Boot.
 */
import { apiClient } from '../../../core/api/apiClient';

// Datos de simulación inicial alineados con database/init.sql
const MOCK_PRODUCTS = [
  {
    id: 1,
    sku: 'URB-001',
    barcode: '7751234567890',
    name: 'Polera Oversize Urban',
    description: 'Algodón reactivo 100% corte amplio unisex',
    category: 'Urbana',
    categoryId: 2,
    costPrice: 38.00,
    price: 69.90,
    stock: 12,
    minStockAlert: 3,
    isActive: true,
  },
  {
    id: 2,
    sku: 'FEM-002',
    barcode: '7751234567891',
    name: 'Vestido Floral Verano',
    description: 'Tela chalis suave con estampado veraniego',
    category: 'Femenina',
    categoryId: 1,
    costPrice: 45.00,
    price: 89.00,
    stock: 3,
    minStockAlert: 2,
    isActive: true,
  },
  {
    id: 3,
    sku: 'PET-003',
    barcode: '7751234567892',
    name: 'Capa Impermeable Mascota M',
    description: 'Impermeable con forro térmico y broche ajustable',
    category: 'Mascotas',
    categoryId: 3,
    costPrice: 18.00,
    price: 35.00,
    stock: 1,
    minStockAlert: 3,
    isActive: true,
  },
  {
    id: 4,
    sku: 'URB-004',
    barcode: '7751234567893',
    name: 'Jogger Cargo Beige',
    description: 'Dril pesado con bolsillos laterales y elástico en tobillo',
    category: 'Urbana',
    categoryId: 2,
    costPrice: 42.00,
    price: 75.00,
    stock: 0,
    minStockAlert: 2,
    isActive: true,
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Femenina', description: 'Ropa juvenil femenina de temporada' },
  { id: 2, name: 'Urbana', description: 'Moda urbana y streetwear unisex' },
  { id: 3, name: 'Mascotas', description: 'Prendas y accesorios para mascotas' },
];

export const inventoryService = {
  async getProducts() {
    // Modo producción con backend: return apiClient.get('/products');
    return [...MOCK_PRODUCTS];
  },

  async getProductById(id) {
    // return apiClient.get(`/products/${id}`);
    const found = MOCK_PRODUCTS.find((p) => p.id === Number(id));
    if (!found) throw new Error('Producto no encontrado');
    return { ...found };
  },

  async createProduct(productData) {
    // return apiClient.post('/products', productData);
    console.log('[Mock] Creando producto:', productData);
    const newProduct = {
      id: Date.now(),
      ...productData,
      price: parseFloat(productData.price) || 0,
      costPrice: parseFloat(productData.costPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStockAlert: parseInt(productData.minStockAlert, 10) || 3,
      isActive: true,
    };
    return newProduct;
  },

  async updateProduct(id, productData) {
    // return apiClient.put(`/products/${id}`, productData);
    console.log('[Mock] Actualizando producto:', id, productData);
    return { id, ...productData };
  },

  async deleteProduct(id) {
    // return apiClient.delete(`/products/${id}`);
    console.log('[Mock] Eliminando producto (baja lógica):', id);
    return { success: true };
  },

  async getCategories() {
    // return apiClient.get('/categories');
    return [...MOCK_CATEGORIES];
  },
};
