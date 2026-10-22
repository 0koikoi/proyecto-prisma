/**
 * Servicio de pedidos y logística conectado a la API Spring Boot.
 * Responsable: Zully
 */
import { apiClient } from '../../../core/api/apiClient';

export const ordersService = {
  // Obtiene el listado de pedidos desde la API paginada
  async getOrders(status = null, page = 0, size = 50) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    params.append('page', page);
    params.append('size', size);

    const query = params.toString();
    const response = await apiClient.get(`/orders?${query}`);

    // Si viene estructura paginada de Spring Data (Page<OrderResponse>)
    if (response && response.content) {
      return response.content;
    }
    return Array.isArray(response) ? response : [];
  },

  // Consulta el detalle completo de un pedido por ID
  async getOrderById(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },

  // Cambia el estado de un pedido (PREPARING, SHIPPED, DELIVERED, CANCELLED)
  async updateOrderStatus(orderId, updateData) {
    // Si se pasa solo un string de estado, envolverlo en objeto
    const payload = typeof updateData === 'string'
      ? { toStatus: updateData }
      : updateData;

    return apiClient.patch(`/orders/${orderId}/status`, payload);
  },

  // Registra un nuevo pedido digital con requestKey de idempotencia
  async createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },
};
