/**
 * Modal para actualizar el estado del pedido y registrar datos de logística/despacho o cancelación.
 * Conectado con la máquina de estados de Spring Boot /api/orders/{id}/status.
 * Responsable: Zully (Líder del Proyecto)
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  FileText,
  User,
  Phone,
  Car,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  isValidPeruvianPhone,
  sanitizePhoneInput,
} from '../../../shared/utils/validators';

export const OrderStatusModal = ({
  isOpen,
  onClose,
  order,
  targetStatus,
  onConfirm,
}) => {
  const [courierCompany, setCourierCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [shippingEvidenceKey, setShippingEvidenceKey] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setCourierCompany(order.courierCompany || (order.deliveryScope === 'NATIONAL' ? 'Shalom' : 'Motorizado Local'));
      setTrackingNumber(order.trackingNumber || '');
      setDriverName(order.driverName || '');
      setDriverPhone(order.driverPhone || '');
      setVehiclePlate(order.vehiclePlate || '');
      setShippingEvidenceKey(order.shippingEvidenceKey || '');
      setReason('');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, order, targetStatus]);

  if (!order || !targetStatus) return null;

  const isNational = order.deliveryScope === 'NATIONAL';

  const getStatusInfo = () => {
    switch (targetStatus) {
      case 'PREPARING':
        return {
          title: 'Iniciar Preparación del Pedido',
          icon: Truck,
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200',
          btnText: 'Confirmar Preparación',
          btnVariant: 'primary',
        };
      case 'SHIPPED':
        return {
          title: 'Despachar Envío / Registrar Salida',
          icon: CheckCircle2,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 border-indigo-200',
          btnText: 'Confirmar Despacho',
          btnVariant: 'primary',
        };
      case 'DELIVERED':
        return {
          title: 'Confirmar Entrega al Cliente',
          icon: PackageCheck,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-200',
          btnText: 'Marcar como Entregado',
          btnVariant: 'primary',
        };
      case 'CANCELLED':
        return {
          title: 'Cancelar Pedido y Liberar Stock',
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200',
          btnText: 'Confirmar Cancelación',
          btnVariant: 'danger',
        };
      default:
        return {
          title: 'Actualizar Estado del Pedido',
          icon: Clock,
          color: 'text-gray-900',
          bg: 'bg-gray-50 border-gray-200',
          btnText: 'Actualizar',
          btnVariant: 'primary',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      toStatus: targetStatus,
    };

    if (targetStatus === 'SHIPPED') {
      if (isNational) {
        if (!courierCompany.trim()) {
          setErrorMsg('Debe especificar la empresa de courier nacional (ej: Shalom, Olva).');
          return;
        }
        if (!trackingNumber.trim()) {
          setErrorMsg('El número de guía o tracking de envío es obligatorio para despachos nacionales.');
          return;
        }
        payload.courierCompany = courierCompany.trim();
        payload.trackingNumber = trackingNumber.trim();
      } else {
        payload.courierCompany = courierCompany.trim() || 'Motorizado Local';
        payload.driverName = driverName.trim() || null;
        if (driverPhone.trim()) {
          if (!isValidPeruvianPhone(driverPhone)) {
            setErrorMsg('El celular del repartidor debe empezar con 9 y tener 9 dígitos.');
            return;
          }
          payload.driverPhone = driverPhone.trim();
        }
        payload.vehiclePlate = vehiclePlate.trim() || null;
      }
      if (shippingEvidenceKey.trim()) {
        payload.shippingEvidenceKey = shippingEvidenceKey.trim();
      }
    }

    if (targetStatus === 'CANCELLED') {
      if (!reason.trim()) {
        setErrorMsg('El motivo de cancelación es obligatorio.');
        return;
      }
      payload.reason = reason.trim();
    }

    try {
      setIsSubmitting(true);
      await onConfirm(order.id, payload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el estado.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${statusInfo.title} — ${order.orderCode || '#' + order.id}`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Resumen del pedido y cambio */}
        <div className={`p-3.5 rounded-xl border ${statusInfo.bg} flex items-start gap-3`}>
          <statusInfo.icon className={`${statusInfo.color} shrink-0 mt-0.5`} size={20} />
          <div className="text-xs space-y-1">
            <div className="font-bold text-gray-900">
              Cliente: {order.customerName} ({order.customerPhone})
            </div>
            <div className="text-gray-600">
              Modalidad: <span className="font-semibold">{isNational ? '🚚 Envío Nacional' : '📍 Despacho Local'}</span> | Destino: {order.shippingAddress}
            </div>
          </div>
        </div>

        {/* Formulario dinámico según targetStatus */}
        {targetStatus === 'PREPARING' && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <span>
              Al iniciar la preparación, los artículos del pedido quedan formalmente comprometidos en inventario.
            </span>
          </div>
        )}

        {targetStatus === 'SHIPPED' && (
          <div className="space-y-3">
            {isNational ? (
              <>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Info size={14} className="shrink-0 text-amber-600" />
                  <span>Para envíos nacionales se requiere guía de remisión o clave de agencia (RN06).</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Empresa Courier</label>
                    <div className="input-wrapper">
                      <select
                        value={courierCompany}
                        onChange={(e) => setCourierCompany(e.target.value)}
                        className="input-element cursor-pointer"
                      >
                        <option value="Shalom">Shalom</option>
                        <option value="Olva Courier">Olva Courier</option>
                        <option value="Marvisur">Marvisur</option>
                        <option value="Comité 6">Comité 6 (Colectivo)</option>
                        <option value="Otra Agencia">Otra Agencia</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label="N° de Guía / Clave de Seguimiento"
                    placeholder="Ej: SH-778921"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    icon={FileText}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Input
                    label="Repartidor / Chofer"
                    placeholder="Ej: Pedro Ramos"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    icon={User}
                  />
                  <div>
                    <Input
                      label="Celular Repartidor"
                      placeholder="987654321"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(sanitizePhoneInput(e.target.value))}
                      icon={Phone}
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      9 dígitos (empieza con 9)
                    </span>
                  </div>
                  <Input
                    label="Placa de Vehículo"
                    placeholder="Ej: 4521-3A"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    icon={Car}
                  />
                </div>
              </>
            )}

            <Input
              label="Código / URL de Comprobante o Foto de Envío (Opcional)"
              placeholder="Ej: remision-shalom-8821.jpg o enlace"
              value={shippingEvidenceKey}
              onChange={(e) => setShippingEvidenceKey(e.target.value)}
              icon={FileText}
            />
          </div>
        )}

        {targetStatus === 'DELIVERED' && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Se marcará el pedido como finalizado con entrega conforme al cliente. Esta acción concluye el ciclo del pedido.
            </span>
          </div>
        )}

        {targetStatus === 'CANCELLED' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atención:</strong> La cancelación liberará automáticamente todo el stock reservado en Neon PostgreSQL y registrará la anulación.
              </span>
            </div>

            <div>
              <label className="input-label">
                Motivo de Cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Indique la razón: cliente desistió de compra, falta de pago oportuno, dirección inaccesible..."
                rows={3}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        )}

        {/* Botones de acción responsive */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Volver
          </Button>
          <Button
            variant={statusInfo.btnVariant}
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Procesando...' : statusInfo.btnText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
