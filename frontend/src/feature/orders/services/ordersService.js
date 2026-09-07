/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos y Logística de Envíos — Servicios de Órdenes
 *
 * Conecta la gestión de pedidos digitales (WhatsApp, Messenger, Web)
 * y seguimiento de envíos vía couriers (Shalom, Comité 6, Motorizado) con Spring Boot.
 *
 * ENDPOINTS ASOCIADOS (Sprint 7):
 *  - GET   /api/orders               -> Listado general de pedidos
 *  - GET   /api/orders/{id}          -> Detalle del pedido y productos
 *  - PATCH /api/orders/{id}/status   -> Actualizar estado (PENDING, PREPARING, SHIPPED, DELIVERED)
 *  - POST  /api/orders               -> Registrar nuevo pedido manual o desde WhatsApp
 *
 * TODO Zully:
 *  - Conectar llamadas reales cuando el backend esté levantado.
 */
import { apiClient } from '../../../core/api/apiClient';

const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    customerName: 'Lucía Morales',
    phone: '987654321',
    channel: 'WhatsApp',
    shippingAddress: 'Jr. Dos de Mayo 450, Huánuco',
    reference: 'Frente al parque infantil',
    total: 125.0,
    status: 'ENVIADO',
    courier: 'Shalom',
    trackingNumber: 'SH-884210',
    createdAt: '2026-09-06T14:30:00Z',
    items: [
      { id: 1, productName: 'Polera Oversize Urban', quantity: 1, price: 69.90 },
      { id: 3, productName: 'Capa Impermeable Mascota M', quantity: 1, price: 35.00 },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Carlos Ruiz',
    phone: '912345678',
    channel: 'Tienda Online',
    shippingAddress: 'Av. Universitaria 120, Pillco Marca',
    reference: 'Puerta blanca',
    total: 89.0,
    status: 'PENDIENTE',
    courier: 'Motorizado Local',
    trackingNumber: '-',
    createdAt: '2026-09-06T12:15:00Z',
    items: [
      { id: 2, productName: 'Vestido Floral Verano', quantity: 1, price: 89.00 },
    ],
  },
  {
    id: 'ORD-1003',
    customerName: 'Andrea Silva',
    phone: '998877665',
    channel: 'Messenger',
    shippingAddress: 'Jr. Huánuco 780, Tingo María',
    reference: 'Cerca a la agencia de transportes',
    total: 155.0,
    status: 'EN_PREPARACION',
    courier: 'Comité 6',
    trackingNumber: 'Placa ABC-123',
    createdAt: '2026-09-06T09:40:00Z',
    items: [
      { id: 1, productName: 'Polera Oversize Urban', quantity: 2, price: 69.90 },
    ],
  },
];

export const ordersService = {
  async getOrders() {
    // Modo producción con backend: return apiClient.get('/orders');
    return [...MOCK_ORDERS];
  },

  async getOrderById(orderId) {
    // return apiClient.get(`/orders/${orderId}`);
    const found = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!found) throw new Error('Pedido no encontrado');
    return { ...found };
  },

  async updateOrderStatus(orderId, status) {
    // return apiClient.patch(`/orders/${orderId}/status`, { status });
    console.log('[Mock Pedidos] Actualizando estado de pedido:', orderId, status);
    return { success: true, orderId, status };
  },

  async createOrder(orderData) {
    // return apiClient.post('/orders', orderData);
    console.log('[Mock Pedidos] Creando nuevo pedido:', orderData);
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'PENDIENTE',
    };
    return newOrder;
  },
};
