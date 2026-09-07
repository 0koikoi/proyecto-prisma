/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos y Logística — Hook de Pedidos
 *
 * Administra la carga de pedidos, filtro por estado (PENDIENTE, EN_PREPARACION, ENVIADO)
 * y la actualización reactiva del estado del envío.
 *
 * TODO Zully:
 *  - Agregar filtro adicional por canal (WhatsApp vs Web) o por Courier (Shalom vs Comité 6).
 */
import { useState, useEffect } from 'react';
import { ordersService } from '../services/ordersService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    return statusFilter === 'ALL' || o.status === statusFilter;
  });

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    statusFilter,
    setStatusFilter,
    updateStatus,
    reload: fetchOrders,
  };
};
