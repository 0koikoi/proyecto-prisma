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

export const cashService = {
  async getStatus() {
    // Modo producción con backend: return apiClient.get('/cash-register/status');
    return {
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
  },

  async openRegister(initialAmount) {
    // return apiClient.post('/cash-register/open', { initialCash: initialAmount });
    console.log('[Mock Caja] Apertura con saldo inicial:', initialAmount);
    return { success: true, registerId: Date.now() };
  },

  async closeRegister(closeData) {
    // return apiClient.post('/cash-register/close', closeData);
    console.log('[Mock Caja] Cierre de turno y arqueo:', closeData);
    return { success: true };
  },
};
