/**
 * Directorio de proveedores y reposiciones de stock.
 * Responsable: Zully
 */
import { apiClient } from '../../../core/api/apiClient';

let MOCK_SUPPLIERS = [
  {
    id: 1,
    companyName: 'Confecciones Textiles Gamarra S.A.C.',
    contactName: 'Jorge Mendoza',
    phone: '981234567',
    email: 'ventas@textilesgamarra.pe',
    taxId: '20601234567',
    address: 'Jr. Gamarra 1240, Galería La Virreyna, Stand 305, Lima',
    productsSupplied: 'Ropa Urbana y Juvenil Femenina',
  },
  {
    id: 2,
    companyName: 'Pet Fashion Perú',
    contactName: 'Carla Dávila',
    phone: '976543210',
    email: 'contacto@petfashion.pe',
    taxId: '20509876543',
    address: 'Av. Iquitos 840, La Victoria, Lima',
    productsSupplied: 'Capas y arneses para mascotas',
  },
];

let MOCK_PURCHASES = [];

export const suppliersService = {
  async getSuppliers() {
    // Modo producción con backend: return apiClient.get('/suppliers');
    return [...MOCK_SUPPLIERS];
  },

  async createSupplier(data) {
    // return apiClient.post('/suppliers', data);
    const newSupplier = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    MOCK_SUPPLIERS = [newSupplier, ...MOCK_SUPPLIERS];
    return newSupplier;
  },

  async updateSupplier(id, data) {
    // return apiClient.put(`/suppliers/${id}`, data);
    MOCK_SUPPLIERS = MOCK_SUPPLIERS.map((s) =>
      s.id === id ? { ...s, ...data } : s
    );
    return { id, ...data };
  },

  /**
   * RF19: Registra una reposición de stock vinculada a un proveedor.
   */
  async registerRestock(restockData) {
    // return apiClient.post('/purchases', restockData);
    const purchase = {
      id: `PUR-${Date.now().toString().slice(-4)}`,
      ...restockData,
      purchasedAt: new Date().toISOString(),
    };
    MOCK_PURCHASES.unshift(purchase);
    return { success: true, purchase };
  },

  async getPurchasesHistory() {
    return [...MOCK_PURCHASES];
  },
};
