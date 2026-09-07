/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Formulario de Producto
 *
 * Modal para crear o editar un producto del catálogo.
 *
 * TODO Mauricio: Agregar campo "Código de Barras" (barcode) — RF06.
 * TODO Mauricio: Agregar campo "Costo de Compra (S/)" (costPrice) — REQUERIDO para márgenes.
 * TODO Mauricio: Agregar campo "Proveedor" — select cargado desde GET /api/suppliers.
 * TODO Mauricio: Agregar campo "Imagen URL" o upload de imagen.
 * TODO Mauricio: Agregar validación del formulario antes de llamar a onSave().
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

const EMPTY_FORM = {
  name: '',
  sku: '',
  barcode: '',   // TODO Mauricio: código de barras EAN/UPC (opcional)
  category: 'Femenina',
  costPrice: '', // TODO Mauricio: costo de compra (requerido para margen)
  price: '',
  stock: '',
};

export const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(product ? { ...EMPTY_FORM, ...product } : EMPTY_FORM);
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO Mauricio: validar que costPrice y price sean números positivos
    onSave({
      ...form,
      price: parseFloat(form.price),
      costPrice: parseFloat(form.costPrice),
      stock: parseInt(form.stock, 10),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Producto' : 'Nuevo Producto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nombre del Producto" name="name" value={form.name} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="SKU Corto" name="sku" value={form.sku} onChange={handleChange} placeholder="ej. URB-001" required />
          <Input label="Código de Barras (EAN/UPC)" name="barcode" value={form.barcode} onChange={handleChange} placeholder="ej. 7751234567890 (opcional)" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="input-label" htmlFor="category">Categoría</label>
          <div className="input-wrapper">
            <select id="category" name="category" value={form.category} onChange={handleChange} className="input-element">
              <option value="Femenina">Ropa Juvenil Femenina</option>
              <option value="Urbana">Ropa Urbana</option>
              <option value="Mascotas">Ropa de Mascotas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* TODO Mauricio: el costPrice es OBLIGATORIO para que Meli pueda calcular márgenes */}
          <Input label="Costo de Compra (S/)" name="costPrice" type="number" value={form.costPrice} onChange={handleChange} placeholder="0.00" required />
          <Input label="Precio de Venta (S/)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </div>

        <Input label="Stock Inicial" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" required />

        {/* TODO Mauricio: agregar el select de Proveedor (GET /api/suppliers) */}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{product ? 'Guardar Cambios' : 'Registrar Producto'}</Button>
        </div>
      </form>
    </Modal>
  );
};
