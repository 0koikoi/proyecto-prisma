/**
 * Modal para registrar pedidos manuales ingresados por WhatsApp, Messenger o Web.
 * Conectado con los contratos y restricciones de la base de datos Neon.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { inventoryService } from '../../inventory/services/inventoryService';
import { formatCurrency } from '../../../shared/utils/formatters';
import {
  isValidPeruvianPhone,
  sanitizePhoneInput,
  isValidPersonName,
} from '../../../shared/utils/validators';
import {
  User,
  Phone,
  MapPin,
  Truck,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Navigation,
  Car,
} from 'lucide-react';

export const OrderFormModal = ({ isOpen, onClose, onSave }) => {
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');
  const [shippingAddress, setShippingAddress] = useState('');
  const [reference, setReference] = useState('');
  const [deliveryScope, setDeliveryScope] = useState('LOCAL');
  const [courierCompany, setCourierCompany] = useState('Motorizado Local');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('YAPE');
  const [shippingCost, setShippingCost] = useState(6.0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  // Selector de producto
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar catálogo de productos
  useEffect(() => {
    if (isOpen) {
      inventoryService.getProducts().then((prods) => {
        setProductsCatalog(prods || []);
        if (prods && prods.length > 0) {
          setSelectedProductId(prods[0].id.toString());
        }
      });

      // Limpiar formulario al abrir
      setCustomerName('');
      setPhone('');
      setChannel('WHATSAPP');
      setShippingAddress('');
      setReference('');
      setDeliveryScope('LOCAL');
      setCourierCompany('Motorizado Local');
      setTrackingNumber('');
      setDriverName('');
      setDriverPhone('');
      setVehiclePlate('');
      setPaymentMethod('YAPE');
      setShippingCost(6.0);
      setNotes('');
      setItems([]);
      setSelectedQty(1);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Actualizar ámbito y courier sugerido
  const handleScopeChange = (scope) => {
    setDeliveryScope(scope);
    if (scope === 'NATIONAL') {
      setCourierCompany('Shalom');
      setShippingCost(12.0);
    } else {
      setCourierCompany('Motorizado Local');
      setShippingCost(6.0);
    }
  };

  const handleCourierChange = (e) => {
    const val = e.target.value;
    setCourierCompany(val);
    if (val === 'Shalom') setShippingCost(12.0);
    else if (val === 'Olva Courier') setShippingCost(15.0);
    else if (val === 'Comité 6') setShippingCost(15.0);
    else if (val === 'Motorizado Local') setShippingCost(6.0);
    else setShippingCost(0.0);
  };

  const handleAddItem = () => {
    const prod = productsCatalog.find((p) => p.id.toString() === selectedProductId.toString());
    if (!prod) return;

    const qty = parseInt(selectedQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const existingIndex = items.findIndex((it) => it.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + qty;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = Number((newQty * prod.price).toFixed(2));
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          variantId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: qty,
          price: prod.price,
          subtotal: Number((qty * prod.price).toFixed(2)),
        },
      ]);
    }
    setSelectedQty(1);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalProducts = items.reduce((acc, it) => acc + it.subtotal, 0);
  const totalOrder = Number((totalProducts + Number(shippingCost || 0)).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidPersonName(customerName)) {
      setErrorMsg('El nombre del cliente debe tener al menos 3 caracteres y contener solo letras y espacios.');
      return;
    }
    if (!isValidPeruvianPhone(phone)) {
      setErrorMsg('El teléfono del cliente debe ser un celular peruano válido: empezar sí o sí con 9 y tener exactamente 9 dígitos.');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMsg('La dirección de entrega es obligatoria.');
      return;
    }
    if (!reference.trim()) {
      setErrorMsg('La referencia de ubicación es obligatoria para el despacho.');
      return;
    }
    if (driverPhone.trim() && !isValidPeruvianPhone(driverPhone)) {
      setErrorMsg('El teléfono del conductor/repartidor debe ser un celular válido (empieza con 9 y 9 dígitos).');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Debe agregar al menos un producto al pedido.');
      return;
    }

    // Payload formal para backend Spring Boot /api/orders
    const newOrderPayload = {
      requestKey: crypto.randomUUID ? crypto.randomUUID() : null,
      channel,
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      shippingAddress: shippingAddress.trim(),
      reference: reference.trim(),
      deliveryScope,
      requestedPaymentMethod: paymentMethod,
      shippingCost: Number(shippingCost || 0),
      courierCompany: courierCompany.trim() || null,
      trackingNumber: trackingNumber.trim() || null,
      driverName: driverName.trim() || null,
      driverPhone: driverPhone.trim() || null,
      vehiclePlate: vehiclePlate.trim() || null,
      notes: notes.trim() || null,
      items: items.map((it) => ({
        variantId: it.variantId,
        quantity: it.quantity,
      })),
    };

    try {
      setIsSubmitting(true);
      await onSave(newOrderPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Pedido (WhatsApp / Courier)" maxWidth="640px">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Datos del Cliente y Canal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nombre del Cliente"
              placeholder="Ej: Lucía Morales"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              icon={User}
              required
            />
          </div>
          <div>
            <label className="input-label">Canal de Venta</label>
            <div className="input-wrapper">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="input-element cursor-pointer"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="MESSENGER">Messenger</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIENDA_ONLINE">Tienda Online</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Teléfono / Celular (Perú)"
              placeholder="987654321"
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              icon={Phone}
              required
            />
            <span className="text-[11px] text-gray-500 mt-1 block">
              9 dígitos numéricos iniciando con 9. ({phone.length}/9)
            </span>
          </div>
          <Input
            label="Dirección Exacta de Entrega"
            placeholder="Ej: Jr. Dos de Mayo 450, Huánuco"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            icon={MapPin}
            required
          />
        </div>

        <Input
          label="Referencia de Ubicación (Requerido para repartidor)"
          placeholder="Ej: Frente al parque infantil / Puerta de rejas blancas"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          icon={Navigation}
          required
        />

        {/* Ámbito y Courier */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Truck size={14} /> Logística y Ámbito de Despacho
            </span>

            {/* Selector LOCAL vs NATIONAL */}
            <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white">
              <button
                type="button"
                onClick={() => handleScopeChange('LOCAL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  deliveryScope === 'LOCAL'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Local (Huánuco)
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('NATIONAL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  deliveryScope === 'NATIONAL'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nacional (Provincias)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Empresa / Modalidad de Envío</label>
              <div className="input-wrapper">
                <select
                  value={courierCompany}
                  onChange={handleCourierChange}
                  className="input-element cursor-pointer"
                >
                  {deliveryScope === 'LOCAL' ? (
                    <>
                      <option value="Motorizado Local">Motorizado Local (Huánuco / Amarilis / Pillco Marca)</option>
                      <option value="Recojo en Tienda">Recojo en Tienda Física</option>
                    </>
                  ) : (
                    <>
                      <option value="Shalom">Shalom (Agencia Nacional)</option>
                      <option value="Olva Courier">Olva Courier (A Domicilio / Agencia)</option>
                      <option value="Comité 6">Comité 6 (Colectivo Interprovincial)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Costo de Envío (S/)"
                type="number"
                step="0.5"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Campos dinámicos según Courier */}
          {(courierCompany === 'Shalom' || courierCompany === 'Olva Courier') && (
            <Input
              label="N° de Guía o Clave de Envío"
              placeholder="Ej: SH-884210"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              icon={FileText}
            />
          )}

          {courierCompany === 'Comité 6' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                label="Nombre Chofer"
                placeholder="Ej: Juan Pérez"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                icon={User}
              />
              <Input
                label="Celular Chofer"
                placeholder="Ej: 962112233"
                value={driverPhone}
                onChange={(e) => setDriverPhone(sanitizePhoneInput(e.target.value))}
                icon={Phone}
              />
              <Input
                label="Placa Auto"
                placeholder="Ej: ABC-123"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                icon={Car}
              />
            </div>
          )}
        </div>

        {/* Selección de Productos */}
        <div className="p-3.5 rounded-xl border border-gray-200 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
            Productos Solicitados
          </label>
          <div className="flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 outline-none focus:ring-2 focus:ring-[#1c1c1c]"
            >
              {productsCatalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} (Stock: {p.stock || p.currentStock || 0})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={selectedQty}
              onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 h-9 px-2 text-center border border-gray-300 rounded-lg text-xs font-bold text-gray-800 outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              type="button"
              onClick={handleAddItem}
            >
              Agregar
            </Button>
          </div>

          {/* Lista de productos agregados */}
          {items.length > 0 ? (
            <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 text-xs bg-white">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-gray-900">{it.productName}</span>
                    <span className="text-gray-500 ml-2">x {it.quantity}</span>
                  </div>
                  <div className="font-bold text-gray-900 mr-2">
                    {formatCurrency(it.subtotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    title="Quitar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-2">
              No hay productos agregados al pedido.
            </p>
          )}

          {/* Método de pago y totales */}
          <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-gray-600">Medio de Pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-8 px-2 border border-gray-300 rounded-lg text-xs font-semibold bg-white text-gray-800 outline-none"
              >
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="EFECTIVO">Efectivo / Contraentrega</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="text-xs text-gray-500">
                Productos: {formatCurrency(totalProducts)} + Envío: {formatCurrency(shippingCost || 0)}
              </div>
              <div className="text-base font-black text-gray-900">
                Total: {formatCurrency(totalOrder)}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción adaptables responsive */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Pedido'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
