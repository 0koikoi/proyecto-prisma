/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Servicio de Caja
 *
 * Conecta el estado de apertura, ventas acumuladas por medio de pago
 * y cierre de turno con el backend de Spring Boot.
 *
 * ENDPOINTS ASOCIADOS (Sprint 7):
 *  - GET  /api/cash-register/status -> Retorna si la caja está abierta y totales por método
 *  - POST /api/cash-register/open   -> Registra apertura de caja con sencillo inicial
 *  - POST /api/cash-register/close  -> Registra cierre con efectivo contado y descuadre
 *
 * TODO Leo:
 *  - Conectar llamadas reales cuando el backend esté levantado.
 */
import { apiClient } from '../../../core/api/apiClient';

// Estado del mock en memoria (se reemplaza por la API real en Sprint 7).
// Antes `getStatus()` devolvía `isOpen: true` fijo sin importar lo que hiciera
// openRegister()/closeRegister(), por lo que el POS nunca podía detectar una
// caja realmente cerrada. Ahora el mock recuerda el estado entre llamadas.
let mockCashState = {
  isOpen: true,
  registerId: 1,
  openedBy: 'Leo Vendedor',
  openedAt: new Date().toISOString(),
  initialCash: 100.0,
  totalCashSales: 150.0,
  totalYapeSales: 210.0,
  totalPlinSales: 70.0,
  totalCardSales: 0.0,
};

export const cashService = {
  async getStatus() {
    // Modo producción con backend: return apiClient.get('/cash-register/status');
    return { ...mockCashState };
  },

  async openRegister(initialAmount) {
    // return apiClient.post('/cash-register/open', { initialCash: initialAmount });
    console.log('[Mock Caja] Apertura con saldo inicial:', initialAmount);
    mockCashState = {
      ...mockCashState,
      isOpen: true,
      initialCash: initialAmount,
      openedBy: 'Leo Vendedor',
      openedAt: new Date().toISOString(),
      totalCashSales: 0,
      totalYapeSales: 0,
      totalPlinSales: 0,
      totalCardSales: 0,
    };
    return { success: true, registerId: Date.now() };
  },

  async closeRegister(closeData) {
    // return apiClient.post('/cash-register/close', closeData);
    console.log('[Mock Caja] Cierre de turno y arqueo:', closeData);
    mockCashState = { ...mockCashState, isOpen: false };
    return { success: true };
  },

  /**
   * Suma el monto de una venta del POS al total del método de pago correspondiente.
   * Antes una venta en el POS nunca se reflejaba en los totales de Caja.
   */
  async registerSale({ paymentMethod, amount }) {
    // return apiClient.post('/cash-register/register-sale', { paymentMethod, amount });
    const fieldByMethod = {
      EFECTIVO: 'totalCashSales',
      YAPE: 'totalYapeSales',
      PLIN: 'totalPlinSales',
      TARJETA: 'totalCardSales',
    };
    const field = fieldByMethod[paymentMethod];
    if (field) {
      mockCashState = { ...mockCashState, [field]: mockCashState[field] + amount };
    }
    return { success: true };
  },
};
