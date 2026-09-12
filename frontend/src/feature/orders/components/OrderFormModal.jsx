/**
 * Modal para registrar pedidos manuales ingresados por WhatsApp, Messenger o Web.
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { inventoryService } from '../../inventory/services/inventoryService';
import { formatCurrency } from '../../../shared/utils/formatters';
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
  const [channel, setChannel] = useState('WhatsApp');
  const [shippingAddress, setShippingAddress] = useState('');
  const [reference, setReference] = useState('');
  const [courier, setCourier] = useState('Shalom');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('YAPE');
  const [shippingCost, setShippingCost] = useState(10.0);
  const [items, setItems] = useState([]);

  // Selector de producto temporal
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar catálogo de productos para el selector
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
      setChannel('WhatsApp');
      setShippingAddress('');
      setReference('');
      setCourier('Shalom');
      setTrackingNumber('');
      setCarPlate('');
      setDriverPhone('');
      setPaymentMethod('YAPE');
      setShippingCost(10.0);
      setItems([]);
      setSelectedQty(1);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Actualizar costo sugerido según courier
  const handleCourierChange = (e) => {
    const val = e.target.value;
    setCourier(val);
    if (val === 'Shalom') setShippingCost(12.0);
    else if (val === 'Comité 6') setShippingCost(15.0);
    else if (val === 'Motorizado Local') setShippingCost(6.0);
    else setShippingCost(0.0);
  };

  const handleAddItem = () => {
    const prod = productsCatalog.find((p) => p.id.toString() === selectedProductId.toString());
    if (!prod) return;

    const qty = parseInt(selectedQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    // Verificar si ya está en la lista
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
          productName: prod.name,
          sku: prod.sku,
          quantity: qty,
          price: prod.price,
          costPrice: prod.costPrice || 0,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('El nombre del cliente es obligatorio');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('El teléfono del cliente es obligatorio');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMsg('La dirección de entrega es obligatoria');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Debe agregar al menos un producto al pedido');
      return;
    }

    // Resolver tracking según courier
    let finalTracking = trackingNumber.trim();
    if (courier === 'Comité 6') {
      finalTracking = `Placa: ${carPlate.trim() || 'S/N'} - Chofer: ${driverPhone.trim() || 'S/N'}`;
    } else if (courier === 'Motorizado Local') {
      finalTracking = 'Reparto Express Local';
    }

    const newOrderData = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      channel,
      shippingAddress: shippingAddress.trim(),
      reference: reference.trim(),
      courier,
      trackingNumber: finalTracking || '-',
      paymentMethod,
      shippingCost: Number(shippingCost || 0),
      totalProducts,
      total: totalOrder,
      items,
      notes: reference.trim(),
    };

    onSave(newOrderData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Pedido (WhatsApp / Courier)" maxWidth="640px">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {errorMsg}
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
                <option value="WhatsApp">WhatsApp</option>
                <option value="Messenger">Messenger</option>
                <option value="Tienda Online">Tienda Online</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teléfono / WhatsApp"
            placeholder="Ej: 987654321"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={Phone}
            required
          />
          <Input
            label="Dirección de Entrega"
            placeholder="Ej: Jr. Dos de Mayo 450, Huánuco"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            icon={MapPin}
            required
          />
        </div>

        <Input
          label="Referencia de Ubicación"
          placeholder="Ej: Frente al parque infantil / Puerta de rejas blancas"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          icon={Navigation}
        />

        {/* Courier y Envíos */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Truck size={14} /> Logística de Envío
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Empresa / Courier</label>
              <div className="input-wrapper">
                <select
                  value={courier}
                  onChange={handleCourierChange}
                  className="input-element cursor-pointer"
                >
                  <option value="Shalom">Shalom (Nacional / Interprovincial)</option>
                  <option value="Comité 6">Comité 6 (Autos Regionales)</option>
                  <option value="Motorizado Local">Motorizado Local (Huánuco / Pillco Marca)</option>
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

          {/* Campos específicos por Courier */}
          {courier === 'Shalom' && (
            <Input
              label="N° de Guía de Remisión Shalom"
              placeholder="Ej: SH-884210"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              icon={FileText}
            />
          )}

          {courier === 'Comité 6' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Placa del Vehículo"
                placeholder="Ej: ABC-123"
                value={carPlate}
                onChange={(e) => setCarPlate(e.target.value)}
                icon={Car}
              />
              <Input
                label="Teléfono del Conductor"
                placeholder="Ej: 962112233"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                icon={Phone}
              />
            </div>
          )}
        </div>

        {/* Selección de Productos */}
        <div className="p-3.5 rounded-xl border border-gray-200 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
            Productos del Pedido
          </label>
          <div className="flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 outline-none focus:ring-2 focus:ring-[#1c1c1c]"
            >
              {productsCatalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} (Stock: {p.stock})
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
                    className="text-gray-400 hover:text-red-500 p-1"
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

          {/* Método de pago y resumen de totales */}
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
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CONTRAENTREGA">Contraentrega (Efectivo)</option>
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

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Pedido
          </Button>
        </div>
      </form>
    </Modal>
  );
};
