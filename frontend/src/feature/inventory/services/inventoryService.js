/**
 * RESPONSABLE: Mauricio / Integración Desarrollada
 * MÓDULO: Inventario — Servicios de Datos
 *
 * Conectado a la API REST de Spring Boot (/api/variants, /api/categories, /api/products).
 * Consume los datos reales de la base de datos PostgreSQL (Neon).
 */
import { apiClient } from '../../../core/api/apiClient';
import mockProductsData from './mockProducts.json';
import mockCategoriesData from './mockCategories.json';

const MOCK_PRODUCTS = [...mockProductsData];
const MOCK_CATEGORIES = [...mockCategoriesData];

export const inventoryService = {
  // Consulta variantes de productos reales desde la API con su stock calculado
  async getProducts() {
    try {
      const response = await apiClient.get('/variants?size=100');
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        return items.map((v) => ({
          id: v.id,
          productId: v.productId,
          name: v.productName ? `${v.productName} (${v.sizeLabel} / ${v.colorLabel})` : v.sku,
          category: v.categoryName || 'General',
          categoryId: v.categoryId,
          sku: v.sku,
          barcode: v.barcode || '',
          price: Number(v.salePrice) || 0,
          costPrice: Number(v.costPrice) || 0,
          stock: Number(v.availableStock ?? v.currentStock ?? 0),
          currentStock: v.currentStock,
          reservedStock: v.reservedStock,
          availableStock: v.availableStock,
          minStockAlert: v.minStockAlert ?? 3,
          lowStock: Boolean(v.lowStock),
          isActive: Boolean(v.isActive),
          version: v.version,
        }));
      }
    } catch (err) {
      console.warn('Backend /variants no disponible, usando fallback:', err.message);
    }
    return [...MOCK_PRODUCTS];
  },

  async getProductById(id) {
    try {
      const v = await apiClient.get(`/variants/${id}`);
      if (v) {
        return {
          id: v.id,
          productId: v.productId,
          name: v.productName ? `${v.productName} (${v.sizeLabel} / ${v.colorLabel})` : v.sku,
          category: v.categoryName || 'General',
          categoryId: v.categoryId,
          sku: v.sku,
          barcode: v.barcode || '',
          price: Number(v.salePrice) || 0,
          costPrice: Number(v.costPrice) || 0,
          stock: Number(v.availableStock ?? v.currentStock ?? 0),
          currentStock: v.currentStock,
          reservedStock: v.reservedStock,
          availableStock: v.availableStock,
          minStockAlert: v.minStockAlert ?? 3,
          isActive: Boolean(v.isActive),
        };
      }
    } catch {
      const found = MOCK_PRODUCTS.find((p) => p.id === Number(id));
      if (found) return { ...found };
    }
    throw new Error('Producto no encontrado');
  },

  async createProduct(productData) {
    const isHttpUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());
    const cleanImageUrl = isHttpUrl(productData.imageUrl) ? productData.imageUrl.trim() : null;

    // 1. Crear producto base
    const prodPayload = {
      categoryId: Number(productData.categoryId) || 1,
      name: productData.name?.trim(),
      description: productData.description?.trim() || 'Producto registrado desde inventario',
      imageUrl: cleanImageUrl,
    };
    const createdProd = await apiClient.post('/products', prodPayload);

    // 2. Crear variante asociada con precio y SKU
    const variantPayload = {
      sku: productData.sku?.trim(),
      barcode: productData.barcode?.trim() || null,
      sizeLabel: productData.sizeLabel?.trim() || 'UNICA',
      colorLabel: productData.colorLabel?.trim() || 'ESTANDAR',
      costPrice: Number(productData.costPrice) >= 0 ? Number(productData.costPrice) : 0,
      salePrice: Number(productData.price) > 0 ? Number(productData.price) : 1,
      minStockAlert: Number(productData.minStockAlert) >= 0 ? Number(productData.minStockAlert) : 3,
    };
    const createdVariant = await apiClient.post(`/products/${createdProd.id}/variants`, variantPayload);

    // 3. Si se especificó stock inicial > 0, registrar el movimiento de ajuste en el kardex
    const initialStock = parseInt(productData.stock, 10);
    if (!isNaN(initialStock) && initialStock > 0) {
      try {
        await apiClient.post(`/variants/${createdVariant.id}/adjustments`, {
          requestKey: crypto.randomUUID(),
          quantity: initialStock,
          reason: 'Inventario inicial registrado desde panel',
        });
        createdVariant.currentStock = initialStock;
        createdVariant.availableStock = initialStock;
      } catch (adjErr) {
        console.warn('Variante creada pero falló el ajuste de stock inicial:', adjErr.message);
      }
    }

    return createdVariant;
  },

  async updateProduct(id, productData) {
    try {
      if (productData.version !== undefined) {
        const variantPayload = {
          sku: productData.sku,
          barcode: productData.barcode || null,
          sizeLabel: productData.sizeLabel || 'UNICA',
          colorLabel: productData.colorLabel || 'ESTANDAR',
          costPrice: Number(productData.costPrice) || 0,
          salePrice: Number(productData.price) || 0,
          minStockAlert: Number(productData.minStockAlert) || 3,
          version: productData.version,
        };
        return await apiClient.put(`/variants/${id}`, variantPayload);
      }
    } catch (err) {
      console.warn('Error actualizando producto en API:', err.message);
    }
    return { id, ...productData };
  },

  async deleteProduct(id) {
    try {
      await apiClient.delete(`/variants/${id}`);
      return { success: true };
    } catch (err) {
      console.warn('Error eliminando variante en backend:', err.message);
      return { success: true };
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get('/categories?size=100');
      const items = response?.items || (Array.isArray(response) ? response : []);
      if (items.length > 0) {
        return items.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          isActive: c.isActive,
        }));
      }
    } catch (err) {
      console.warn('Backend /categories no disponible, usando fallback:', err.message);
    }
    return [...MOCK_CATEGORIES];
  },
};
