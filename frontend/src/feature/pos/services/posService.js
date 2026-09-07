/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Servicio de Ventas
 *
 * Conecta el proceso de cobro en mostrador con el backend de Spring Boot.
 *
 * ENDPOINTS ASOCIADOS (Sprint 7):
 *  - POST /api/sales               -> Registra la venta transaccional (descuenta stock y genera ticket)
 *  - GET  /api/products/barcode/{code} -> Búsqueda instantánea al escanear código de barras (RF08)
 *
 * TODO Leo:
 *  - Reemplazar el retorno mock por la llamada real con apiClient.post('/sales', saleData).
 *  - Verificar que el backend devuelva el ticket generado y el ID de la transacción.
 */
import { apiClient } from '../../../core/api/apiClient';

export const posService = {
  /**
   * Registra una venta en el sistema.
   * @param {Object} saleData
   * @param {Array} saleData.items - Lista de artículos con { productId, quantity, unitPrice, unitCost }
   * @param {number} saleData.total - Total a cobrar
   * @param {string} saleData.paymentMethod - 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA'
   * @param {number} [saleData.cashGiven] - Dinero entregado en efectivo
   * @param {number} [saleData.cashChange] - Vuelto entregado
   * @param {number} [saleData.cashRegisterId] - ID de la caja del turno actual
   */
  async processSale(saleData) {
    // Modo producción con backend: return apiClient.post('/sales', saleData);
    console.log('[Mock POS] Procesando venta en backend:', saleData);

    const ticketNumber = `TK-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      ticketNumber,
      createdAt: new Date().toISOString(),
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
    };
  },

  /**
   * Busca un producto por código de barras (usado por el escáner USB en modo keyboard wedge).
   */
  async findByBarcode(barcode) {
    // return apiClient.get(`/products/barcode/${barcode}`);
    console.log('[Mock POS] Buscando producto por código de barras:', barcode);
    return null;
  },
};
