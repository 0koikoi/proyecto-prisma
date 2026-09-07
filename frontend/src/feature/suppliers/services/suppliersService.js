/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores y Abastecimiento — Servicios
 *
 * Conecta el directorio de proveedores de mercadería (Gamarra, Pet Fashion, etc.)
 * y el registro de compras/reposición de inventario con Spring Boot.
 *
 * ENDPOINTS ASOCIADOS (Sprint 7):
 *  - GET  /api/suppliers           -> Listado de proveedores
 *  - POST /api/suppliers           -> Registrar nuevo proveedor
 *  - PUT  /api/suppliers/{id}      -> Actualizar datos de contacto / RUC
 *  - POST /api/purchases           -> Registrar reposición de stock (incrementa inventario) — RF19
 *
 * TODO Zully:
 *  - Conectar llamadas reales cuando el backend esté levantado.
 */
import { apiClient } from '../../../core/api/apiClient';

const MOCK_SUPPLIERS = [
  {
    id: 1,
    companyName: 'Confecciones Textiles Gamarra S.A.C.',
    contactName: 'Jorge Mendoza',
    phone: '981234567',
    email: 'ventas@textilesgamarra.pe',
    taxId: '20601234567',
    productsSupplied: 'Ropa Urbana y Juvenil Femenina',
  },
  {
    id: 2,
    companyName: 'Pet Fashion Perú',
    contactName: 'Carla Dávila',
    phone: '976543210',
    email: 'contacto@petfashion.pe',
    taxId: '20509876543',
    productsSupplied: 'Capas y arneses para mascotas',
  },
];

export const suppliersService = {
  async getSuppliers() {
    // Modo producción con backend: return apiClient.get('/suppliers');
    return [...MOCK_SUPPLIERS];
  },

  async createSupplier(data) {
    // return apiClient.post('/suppliers', data);
    console.log('[Mock Proveedores] Registrando nuevo proveedor:', data);
    return {
      id: Date.now(),
      ...data,
    };
  },

  async updateSupplier(id, data) {
    // return apiClient.put(`/suppliers/${id}`, data);
    console.log('[Mock Proveedores] Actualizando proveedor:', id, data);
    return { id, ...data };
  },

  /**
   * RF19: Registra una reposición de stock vinculada a un proveedor.
   * Esto genera una entrada en 'purchases' y aumenta el stock del producto en 'products'.
   */
  async registerRestock(restockData) {
    // return apiClient.post('/purchases', restockData);
    console.log('[Mock Proveedores] Registrando reposición de stock:', restockData);
    return { success: true, purchaseId: `PUR-${Date.now().toString().slice(-4)}` };
  },
};
