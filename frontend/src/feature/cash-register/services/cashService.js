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
 * Sin VITE_USE_BACKEND=true usa el estado mock en memoria (ver core/api/backendMode.js).
 * Con backend, los totales por método y el efectivo esperado los calcula el servidor a partir de los cobros del turno.
 */
import { apiClient } from '../../../core/api/apiClient';
import { USE_BACKEND } from '../../../core/api/backendMode';

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
    if (USE_BACKEND) {
      const status = await apiClient.get('/cash-register/status');
      // El backend nombra el estado `open`; la UI lo consume como `isOpen`.
      return { ...status, isOpen: status.open };
    }
    return { ...mockCashState };
  },

  async openRegister(initialAmount) {
    if (USE_BACKEND) return apiClient.post('/cash-register/open', { initialCash: initialAmount });
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
    // El servidor recalcula el esperado y la diferencia: solo se envía lo contado y las notas.
    if (USE_BACKEND) {
      return apiClient.post('/cash-register/close', {
        countedCash: closeData.countedCash,
        notes: closeData.notes,
      });
    }
    console.log('[Mock Caja] Cierre de turno y arqueo:', closeData);
    mockCashState = { ...mockCashState, isOpen: false };
    return { success: true };
  },

  /**
   * Suma el monto de una venta del POS al total del método de pago correspondiente.
   * Antes una venta en el POS nunca se reflejaba en los totales de Caja.
   */
  async registerSale({ paymentMethod, amount }) {
    // Con backend, POST /api/sales ya dejó el cobro en el turno: no hay nada que sumar desde el cliente.
    if (USE_BACKEND) return { success: true };
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
