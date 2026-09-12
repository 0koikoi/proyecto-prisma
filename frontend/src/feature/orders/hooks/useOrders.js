/**
 * Hook para gestión de pedidos y filtros.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { ordersService } from '../services/ordersService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');

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

  const createOrder = async (orderData) => {
    const created = await ordersService.createOrder(orderData);
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  const filteredOrders = orders.filter((o) => {
    // Filtro por estado
    const matchesStatus =
      statusFilter === 'ALL' ||
      o.status === statusFilter ||
      (statusFilter === 'PENDING' && o.status === 'PENDIENTE') ||
      (statusFilter === 'PREPARING' && o.status === 'EN_PREPARACION') ||
      (statusFilter === 'SHIPPED' && o.status === 'ENVIADO') ||
      (statusFilter === 'DELIVERED' && o.status === 'ENTREGADO');

    // Filtro por canal
    const matchesChannel =
      channelFilter === 'ALL' || o.channel === channelFilter;

    return matchesStatus && matchesChannel;
  });

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    updateStatus,
    createOrder,
    reload: fetchOrders,
  };
};
