/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos y Logística
 *
 * Página de gestión de pedidos recibidos por WhatsApp, Messenger y tienda online.
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Filtros por estado (PENDING, PREPARING, SHIPPED, DELIVERED) y por canal
 *  2. Tabla de pedidos con datos del cliente, courier, método de pago, estado
 *  3. Selector inline de cambio de estado (dropdown en cada fila)
 *  4. Botón para ver el detalle completo de un pedido (productos incluidos)
 *  5. Registro de nuevo pedido manual (recibido por WhatsApp/Messenger)
 *
 * CAMPOS DE TRACKING (plan prisma.md - RF17):
 *  Para Comité 6: placa del auto y contacto del conductor.
 *  Para Shalom: número de guía de envío.
 *  Foto de paquete: al menos guardar una URL de imagen adjunta.
 *
 * CONEXIÓN CON BACKEND:
 *  - GET   /api/orders?status=&channel= → listar pedidos con filtros
 *  - POST  /api/orders                  → registrar pedido manual
 *  - PATCH /api/orders/{id}/status      → cambiar estado del pedido
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

export const OrdersPage = () => {
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
        <Button variant="primary" icon={Plus} onClick={() => alert('Abrir formulario de nuevo pedido')}>
          Nuevo Pedido
        </Button>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 outline-none focus:ring-2 focus:ring-gray-900"
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
