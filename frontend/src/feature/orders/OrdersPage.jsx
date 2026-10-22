/**
 * Pedidos y logística
 * Gestión de órdenes multicanal, couriers, seguimiento de despacho y actualización de estados.
 *
 * Responsable: Zully (Líder del Proyecto)
 */
import { useState, useMemo } from 'react';
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderStatusModal } from './components/OrderStatusModal';
import { Button } from '../../shared/components/Button';
import {
  Plus,
  Search,
  Clock,
  Truck,
  PackageCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '../../core/context/ToastContext';
import { normalizeStatus } from './utils/orderStatus';

export const OrdersPage = () => {
  const { showToast } = useToast();
  const {
    orders,
    allOrders,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    updateStatus,
    createOrder,
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Estado para el modal dedicado de actualización de estados
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusOrderTarget, setStatusOrderTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  // Métricas rápidas (KPIs)
  const metrics = useMemo(() => {
    const list = allOrders || [];
    let pending = 0;
    let preparing = 0;
    let shipped = 0;
    let delivered = 0;

    list.forEach((o) => {
      const norm = normalizeStatus(o.shippingStatus || o.status);
      if (norm === 'PENDING') pending++;
      else if (norm === 'PREPARING') preparing++;
      else if (norm === 'SHIPPED') shipped++;
      else if (norm === 'DELIVERED') delivered++;
    });

    return { pending, preparing, shipped, delivered, total: list.length };
  }, [allOrders]);

  // Manejador para solicitar cambio de estado abriendo el modal dedicado
  const handleRequestStatusChange = (order, targetStatus) => {
    setStatusOrderTarget(order);
    setStatusTarget(targetStatus);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (id, payloadOrStatus, reason) => {
    try {
      const updated = await updateStatus(id, payloadOrStatus, reason);
      const targetStatusName =
        typeof payloadOrStatus === 'object' ? payloadOrStatus.toStatus : payloadOrStatus;

      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...updated,
          shippingStatus: updated?.shippingStatus || targetStatusName,
        }));
      }
      showToast(`Estado del pedido actualizado a ${targetStatusName}.`, 'success');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Error al actualizar el estado del pedido.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const created = await createOrder(orderData);
      setIsFormOpen(false);
      showToast(`Pedido #${created.orderCode || created.id} registrado correctamente.`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar el pedido.';
      showToast(msg, 'error');
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Filtrado final combinando filtros de servidor + búsqueda en tiempo real
  const finalFilteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase().trim();

    return orders.filter((o) => {
      const code = (o.orderCode || '').toLowerCase();
      const customer = (o.customerName || '').toLowerCase();
      const phone = (o.customerPhone || o.phone || '').toLowerCase();
      const tracking = (o.trackingNumber || '').toLowerCase();
      const courier = (o.courierCompany || '').toLowerCase();
      const address = (o.shippingAddress || '').toLowerCase();

      return (
        code.includes(term) ||
        customer.includes(term) ||
        phone.includes(term) ||
        tracking.includes(term) ||
        courier.includes(term) ||
        address.includes(term)
      );
    });
  }, [orders, searchTerm]);

  return (
    <div className="page-container">
      {/* Encabezado con directrices responsive */}
      <div className="page-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pedidos y Logística</h1>
          <p className="page-subtitle mt-0.5">
            Gestión de pedidos de WhatsApp, Messenger, Instagram y tienda online — seguimiento de couriers y estados.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto shadow-sm"
        >
          Nuevo Pedido
        </Button>
      </div>

      {/* Tarjetas interactivas de métricas rápidas (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm'
              : 'bg-white border-gray-200/80 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pendientes</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">{metrics.pending}</div>
          <span className="text-[11px] text-gray-400">Por iniciar preparación</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PREPARING' ? 'ALL' : 'PREPARING')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'PREPARING'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white border-gray-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">En Preparación</span>
            <Truck size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">{metrics.preparing}</div>
          <span className="text-[11px] text-gray-400">Stock comprometido</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'SHIPPED' ? 'ALL' : 'SHIPPED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'SHIPPED'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400 shadow-sm'
              : 'bg-white border-gray-200/80 hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Enviados</span>
            <CheckCircle2 size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">{metrics.shipped}</div>
          <span className="text-[11px] text-gray-400">En ruta o en agencia</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'DELIVERED' ? 'ALL' : 'DELIVERED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'DELIVERED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Entregados</span>
            <PackageCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">{metrics.delivered}</div>
          <span className="text-[11px] text-gray-400">Ciclo completado</span>
        </button>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="filters-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, teléfono o guía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 outline-none focus:ring-2 focus:ring-[#1c1c1c] shadow-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#1c1c1c] cursor-pointer shadow-xs w-full sm:w-auto"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="PREPARING">En preparación</option>
            <option value="SHIPPED">Enviados</option>
            <option value="DELIVERED">Entregados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-10 px-3.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#1c1c1c] cursor-pointer shadow-xs w-full sm:w-auto"
          >
            <option value="ALL">Todos los canales</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="MESSENGER">Messenger</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIENDA_ONLINE">Tienda Online</option>
          </select>
        </div>
      </div>

      {/* Tabla con scroll horizontal optimizado */}
      <div className="content-card p-0 overflow-hidden">
        <OrdersTable
          orders={finalFilteredOrders}
          onUpdateStatus={handleUpdateStatus}
          onViewDetail={handleViewDetail}
          onRequestStatusChange={handleRequestStatusChange}
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
        onUpdateStatus={handleUpdateStatus}
        onRequestStatusChange={handleRequestStatusChange}
      />

      {/* Modal dedicado de actualización de estados y logística */}
      <OrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusOrderTarget(null);
          setStatusTarget(null);
        }}
        order={statusOrderTarget}
        targetStatus={statusTarget}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
};
