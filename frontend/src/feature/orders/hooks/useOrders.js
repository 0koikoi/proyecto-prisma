/**
 * Hook para gestión de pedidos, filtros y estados con la API Spring Boot.
 * Responsable: Zully
 */
import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../services/ordersService';
import { normalizeStatus } from '../utils/orderStatus';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersService.getOrders(statusFilter !== 'ALL' ? statusFilter : null);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus, reason = '') => {
    try {
      const updated = await ordersService.updateOrderStatus(orderId, {
        toStatus: newStatus,
        changeReason: reason || `Transición a ${newStatus} desde el panel de pedidos`,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated, shippingStatus: updated.shippingStatus || newStatus } : o))
      );

      return updated;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    const created = await ordersService.createOrder(orderData);
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  const filteredOrders = orders.filter((o) => {
    // Filtro por estado
    const currentNorm = normalizeStatus(o.shippingStatus || o.status);
    const matchesStatus =
      statusFilter === 'ALL' ||
      currentNorm === statusFilter;

    // Filtro por canal (soporta coincidencia con mayúsculas/minúsculas)
    const oChannel = (o.channel || '').toUpperCase().replace(/\s+/g, '_');
    const matchesChannel =
      channelFilter === 'ALL' ||
      oChannel === channelFilter ||
      (channelFilter === 'TIENDA_ONLINE' && (oChannel === 'WEB' || oChannel === 'TIENDA_ONLINE'));

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
