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
 *
 * DATOS MOCK: viven en mockProducts.json / mockCategories.json (no inline) para
 * poder editarlos rápido al probar escenarios de POS/Caja — catálogo variado con
 * productos agotados (stock 0), con stock bajo (<= minStockAlert) y normales.
 * Los primeros 4 productos siguen alineados 1:1 con el seed de `database/init.sql`;
 * el resto es dataset de prueba adicional del frontend, no está en ese seed todavía.
 */
import { apiClient } from '../../../core/api/apiClient';
import mockProductsData from './mockProducts.json';
import mockCategoriesData from './mockCategories.json';

const MOCK_PRODUCTS = mockProductsData;
const MOCK_CATEGORIES = mockCategoriesData;

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
