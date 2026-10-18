/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Servicio de Ventas
 *
 * Conecta el proceso de cobro en mostrador con el backend de Spring Boot.
 *
 * ENDPOINTS:
 *  - GET  /api/pos/catalog                -> Variantes vendibles con stock disponible (excluye reservas de pedidos)
 *  - GET  /api/pos/catalog/barcode/{code} -> Búsqueda por código de barras (RF08)
 *  - POST /api/sales                      -> Registra la venta transaccional (descuenta stock, kardex y cobro)
 *  - GET  /api/sales                      -> Ventas del turno abierto (consulta y reimpresión de ticket)
 *  - GET  /api/sales/{id}                 -> Detalle de una venta
 *
 * El servidor fija precios, costos, total, turno y responsable. El cliente solo envía las variantes con su
 * cantidad, el descuento pedido, el método de pago y un `requestKey` que evita duplicar la venta al reintentar.
 * Sin VITE_USE_BACKEND=true responde con datos mock (ver core/api/backendMode.js).
 */
import { apiClient } from '../../../core/api/apiClient';
import { USE_BACKEND } from '../../../core/api/backendMode';
import { inventoryService } from '../../inventory/services/inventoryService';

// Ventas del mock en memoria, para poder listarlas y reimprimirlas sin backend.
const mockSales = [];

// Forma común de una venta para el ticket: mismos campos con y sin backend.
const toReceipt = (sale) => ({
  id: sale.id,
  ticketNumber: sale.ticketNumber,
  createdAt: sale.createdAt,
  items: sale.items.map((line) => ({
    id: line.variantId,
    sku: line.sku,
    name: line.name,
    quantity: line.quantity,
    price: line.unitPrice,
  })),
  subtotal: sale.subtotal,
  discount: null,
  discountAmount: sale.discount,
  total: sale.total,
  paymentMethod: sale.paymentMethod,
  cashGiven: sale.cashGiven ?? sale.total,
  vuelto: sale.change,
});

export const posService = {
  /**
   * Catálogo del mostrador. Con backend, `id` es el id de la variante vendible.
   */
  async getCatalog() {
    if (USE_BACKEND) return apiClient.get('/pos/catalog');
    return inventoryService.getProducts();
  },

  /**
   * Registra una venta en el sistema.
   * @param {Object} saleData
   * @param {string} saleData.requestKey - UUID del intento de cobro (idempotencia)
   * @param {Array} saleData.items - Artículos con { variantId, quantity, price }
   * @param {Object|null} saleData.discount - { type: 'PERCENT' | 'AMOUNT', value } o null
   * @param {string} saleData.paymentMethod - 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA'
   * @param {number} [saleData.cashGiven] - Efectivo entregado (solo EFECTIVO)
   * @returns {Promise<Object>} Datos del comprobante: ticketNumber, createdAt, subtotal,
   *   discountAmount, total, paymentMethod, cashGiven y vuelto (con backend, los importes son los del servidor).
   */
  async processSale(saleData) {
    if (!USE_BACKEND) {
      console.log('[Mock POS] Procesando venta en backend:', saleData);
      const mockSale = toReceipt({
        id: Date.now(),
        ticketNumber: `TK-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        items: saleData.items.map((item) => ({
          variantId: item.variantId,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: saleData.subtotal,
        discount: saleData.discountAmount,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod,
        cashGiven: saleData.cashGiven,
        change: saleData.vuelto,
      });
      mockSales.unshift(mockSale);
      return { success: true, ...mockSale };
    }

    const sale = await apiClient.post('/sales', {
      requestKey: saleData.requestKey,
      items: saleData.items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      discount: saleData.discount
        ? { type: saleData.discount.type, value: saleData.discount.value }
        : null,
      paymentMethod: saleData.paymentMethod,
      cashGiven: saleData.paymentMethod === 'EFECTIVO' ? saleData.cashGiven : null,
    });

    return { success: true, ...toReceipt(sale) };
  },

  /**
   * Ventas del turno abierto, de la más reciente a la más antigua, listas para mostrar su ticket.
   */
  async getShiftSales() {
    if (!USE_BACKEND) return [...mockSales];
    const sales = await apiClient.get('/sales');
    return sales.map(toReceipt);
  },

  /**
   * Busca un producto por código de barras (usado por el escáner USB en modo keyboard wedge).
   * Devuelve null si el código no corresponde a ninguna variante vendible.
   */
  async findByBarcode(barcode) {
    if (!USE_BACKEND) {
      console.log('[Mock POS] Buscando producto por código de barras:', barcode);
      return null;
    }
    try {
      return await apiClient.get(`/pos/catalog/barcode/${encodeURIComponent(barcode)}`);
    } catch {
      return null;
    }
  },
};
