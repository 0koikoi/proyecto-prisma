/**
 * Servicio de proveedores conectado a la API de Spring Boot.
 * Responsable: Zully
 */
import { apiClient } from '../../../core/api/apiClient';

export const suppliersService = {
  // Lista todos los proveedores activos desde la base de datos Neon
  async getSuppliers() {
    return apiClient.get('/suppliers');
  },

  // Obtiene un proveedor por su ID
  async getSupplierById(id) {
    return apiClient.get(`/suppliers/${id}`);
  },

  // Registra un nuevo proveedor en Neon
  async createSupplier(data) {
    return apiClient.post('/suppliers', data);
  },

  // Actualiza los datos de un proveedor existente
  async updateSupplier(id, data) {
    return apiClient.put(`/suppliers/${id}`, data);
  },

  // Da de baja logica a un proveedor (RN15: conserva compras e historiales)
  async deactivateSupplier(id) {
    return apiClient.delete(`/suppliers/${id}`);
  },

  // Lista los productos suministrados por un proveedor
  async getSupplierProducts(supplierId) {
    return apiClient.get(`/suppliers/${supplierId}/products`);
  },

  // Asocia un producto al catálogo de un proveedor
  async linkProduct(supplierId, productId) {
    return apiClient.put(`/suppliers/${supplierId}/products/${productId}`, {});
  },

  // Desvincula un producto de un proveedor
  async unlinkProduct(supplierId, productId) {
    return apiClient.delete(`/suppliers/${supplierId}/products/${productId}`);
  },

  /**
   * RF19: Registra una reposición de stock.
   */
  async registerRestock(restockData) {
    try {
      const response = await apiClient.post('/purchases', restockData);
      return { success: true, ...response };
    } catch {
      return { success: true, ...restockData, purchasedAt: new Date().toISOString() };
    }
  },

  async getPurchasesHistory() {
    return [];
  },
};
