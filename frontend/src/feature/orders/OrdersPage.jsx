/**
 * Pedidos y logística
 * Gestión de órdenes multicanal y couriers.
 *
 * Responsable: Zully
 */
import { useState } from 'react';
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { Button } from '../../shared/components/Button';
import { Plus } from 'lucide-react';
import { useToast } from '../../core/context/ToastContext';

export const OrdersPage = () => {
  const { showToast } = useToast();
  const {
    orders,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    updateStatus,
    createOrder,
  } = useOrders();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleUpdateStatus = async (id, newStatus) => {
    await updateStatus(id, newStatus);
    showToast(`Estado de pedido #${id} actualizado a ${newStatus}.`, 'success');
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const created = await createOrder(orderData);
      setIsFormOpen(false);
      showToast(`Pedido #${created.id} registrado correctamente.`, 'success');
    } catch (err) {
      showToast('Error al registrar el pedido.', 'error');
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Pedidos y Logística</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pedidos de WhatsApp, Messenger y tienda online — seguimiento de estado y courier.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsFormOpen(true)}
        >
          Nuevo Pedido
        </Button>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#1c1c1c] cursor-pointer shadow-xs"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="PREPARING">En preparación</option>
            <option value="SHIPPED">Enviados</option>
            <option value="DELIVERED">Entregados</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-10 px-3.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#1c1c1c] cursor-pointer shadow-xs"
          >
            <option value="ALL">Todos los canales</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Messenger">Messenger</option>
            <option value="Tienda Online">Tienda Online</option>
          </select>
        </div>
      </div>

      <div className="content-card p-0 overflow-hidden">
        <OrdersTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* Modal de nuevo pedido manual */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrder}
      />

      {/* Modal de detalle de pedido */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};
