/**
 * Pedidos y logística
 * Gestión de órdenes multicanal y couriers.
 *
 * TODO Zully: Conectar con GET /api/orders al cargar la página.
 * TODO Zully: Implementar el modal de "Nuevo Pedido" para registrar pedidos de WhatsApp.
 * TODO Zully: Al confirmar pago de un pedido, llamar al backend para descontar el stock.
 * TODO Zully: El campo trackingNumber debe aceptar número de guía Shalom o placa Comité 6.
 */
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { Button } from '../../shared/components/Button';
import { Plus } from 'lucide-react';
import { useToast } from '../../core/context/ToastContext';

export const OrdersPage = () => {
  const { showToast } = useToast();
  const { orders, statusFilter, setStatusFilter, updateStatus } = useOrders();

  const handleUpdateStatus = async (id, newStatus) => {
    await updateStatus(id, newStatus);
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
        {/* TODO Zully: abrir modal de registro de pedido manual */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => showToast('Módulo de nuevo pedido manual en desarrollo.', 'info')}
        >
          Nuevo Pedido
        </Button>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="flex gap-3">
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
          {/* TODO Zully: agregar filtro por canal (WHATSAPP / MESSENGER / TIENDA_ONLINE) */}
        </div>
      </div>

      <div className="content-card p-0 overflow-hidden">
        <OrdersTable orders={orders} onUpdateStatus={handleUpdateStatus} />
      </div>
    </div>
  );
};
