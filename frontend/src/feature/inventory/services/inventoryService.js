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

let MOCK_PRODUCTS = [...mockProductsData];
const MOCK_CATEGORIES = [...mockCategoriesData];

export const inventoryService = {
  async getProducts() {
    return [...MOCK_PRODUCTS];
  },

  async getProductById(id) {
    const found = MOCK_PRODUCTS.find((p) => p.id === Number(id));
    if (!found) throw new Error('Producto no encontrado');
    return { ...found };
  },

  async createProduct(productData) {
    const categoryObj = MOCK_CATEGORIES.find((c) => c.id === Number(productData.categoryId));
    const newProduct = {
      id: Date.now(),
      ...productData,
      category: categoryObj ? categoryObj.name : 'General',
      price: parseFloat(productData.price) || 0,
      costPrice: parseFloat(productData.costPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStockAlert: parseInt(productData.minStockAlert, 10) || 3,
      isActive: true,
    };
    MOCK_PRODUCTS = [newProduct, ...MOCK_PRODUCTS];
    return newProduct;
  },

  async updateProduct(id, productData) {
    const categoryObj = MOCK_CATEGORIES.find((c) => c.id === Number(productData.categoryId));
    MOCK_PRODUCTS = MOCK_PRODUCTS.map((p) => {
      if (p.id === Number(id)) {
        return {
          ...p,
          ...productData,
          category: categoryObj ? categoryObj.name : p.category,
          price: parseFloat(productData.price) || p.price,
          costPrice: parseFloat(productData.costPrice) || p.costPrice,
          stock: parseInt(productData.stock, 10) ?? p.stock,
        };
      }
      return p;
    });
    return { id, ...productData };
  },

  async deleteProduct(id) {
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== Number(id));
    return { success: true };
  },

  async getCategories() {
    return [...MOCK_CATEGORIES];
  },
};
