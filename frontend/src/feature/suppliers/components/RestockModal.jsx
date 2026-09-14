/**
 * Modal de Reposición de Stock / Compra a Proveedor (RF19).
 * Responsable: Zully
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { inventoryService } from '../../inventory/services/inventoryService';
import { formatCurrency } from '../../../shared/utils/formatters';
import {
  PackagePlus,
  Building2,
  DollarSign,
  FileText,
  Boxes,
  ArrowRight,
} from 'lucide-react';

export const RestockModal = ({ isOpen, onClose, onSave, suppliers = [], initialSupplier }) => {
  const [products, setProducts] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [costPrice, setCostPrice] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Cargar productos
      inventoryService.getProducts().then((data) => {
        setProducts(data || []);
        if (data && data.length > 0) {
          setSelectedProductId(data[0].id.toString());
          setCostPrice(data[0].costPrice || 0);
        }
      });

      // Seleccionar proveedor inicial
      if (initialSupplier) {
        setSelectedSupplierId(initialSupplier.id.toString());
      } else if (suppliers.length > 0) {
        setSelectedSupplierId(suppliers[0].id.toString());
      }

      setQuantity(10);
      setInvoiceNumber('');
      setPaymentMethod('TRANSFERENCIA');
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen, initialSupplier, suppliers]);

  const handleProductChange = (e) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    const found = products.find((p) => p.id.toString() === pId.toString());
    if (found) {
      setCostPrice(found.costPrice || 0);
    }
  };

  const selectedProduct = products.find(
    (p) => p.id.toString() === selectedProductId.toString()
  );
  const selectedSupplier = suppliers.find(
    (s) => s.id.toString() === selectedSupplierId.toString()
  );

  const totalCost = Number((Number(quantity || 0) * Number(costPrice || 0)).toFixed(2));

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('La cantidad a reponer debe ser mayor a 0');
      return;
    }
    const cost = parseFloat(costPrice);
    if (isNaN(cost) || cost < 0) {
      setErrorMsg('El costo unitario debe ser válido');
      return;
    }
    if (!selectedSupplierId) {
      setErrorMsg('Debe seleccionar un proveedor');
      return;
    }
    if (!selectedProductId) {
      setErrorMsg('Debe seleccionar un producto');
      return;
    }

    const restockData = {
      supplierId: Number(selectedSupplierId),
      supplierName: selectedSupplier ? selectedSupplier.companyName : '',
      productId: Number(selectedProductId),
      productName: selectedProduct ? selectedProduct.name : '',
      productSku: selectedProduct ? selectedProduct.sku : '',
      quantity: qty,
      costPrice: cost,
      total: totalCost,
      invoiceNumber: invoiceNumber.trim() || `COMP-${Date.now().toString().slice(-4)}`,
      paymentMethod,
      notes: notes.trim(),
    };

    onSave(restockData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reposición de Mercadería (RF19)" maxWidth="560px">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs text-gray-600">
          <span className="font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <PackagePlus size={14} /> Abastecimiento de Inventario
          </span>
          <p className="m-0">
            Registra el ingreso de mercadería adquirida a fabricantes y distribuidores. Actualiza el stock disponible y el registro de compras.
          </p>
        </div>

        {/* Proveedor */}
        <div>
          <label className="input-label">Proveedor / Taller</label>
          <div className="input-wrapper">
            <Building2 size={16} className="text-gray-400 mr-1 shrink-0" />
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="input-element cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName} {s.contactName ? `(${s.contactName})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Producto a reponer */}
        <div>
          <label className="input-label">Producto a Reponer</label>
          <div className="input-wrapper">
            <Boxes size={16} className="text-gray-400 mr-1 shrink-0" />
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="input-element cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}] — Stock actual: {p.stock} unid.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cantidad y Costo de compra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Cantidad a Ingresar (Unidades)"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            icon={Boxes}
            required
          />
          <Input
            label="Costo Unitario de Compra (S/)"
            type="number"
            step="0.1"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            icon={DollarSign}
            required
          />
        </div>

        {/* Comprobante y Medio de pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="N° Factura / Boleta Proveedor"
            placeholder="Ej: F001-00289"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            icon={FileText}
          />
          <div>
            <label className="input-label">Medio de Pago</label>
            <div className="input-wrapper">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-element cursor-pointer"
              >
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen del reabastecimiento */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500 block">Stock Proyectado:</span>
            <div className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
              <span>{selectedProduct ? selectedProduct.stock : 0} unid.</span>
              <ArrowRight size={13} className="text-emerald-600" />
              <span className="text-emerald-700">
                {(selectedProduct ? selectedProduct.stock : 0) + (parseInt(quantity, 10) || 0)} unid.
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block">Inversión Total:</span>
            <span className="text-base font-black text-gray-950">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Confirmar Reposición
          </Button>
        </div>
      </form>
    </Modal>
  );
};
