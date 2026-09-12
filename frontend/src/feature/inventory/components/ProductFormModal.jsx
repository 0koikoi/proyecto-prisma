import { useEffect, useRef, useState } from 'react';
import { InventoryButton, InventoryField, InventoryModal, ProductImage, controlClass } from './InventoryUI';
import { validateProduct } from '../utils/inventory';

function ProductForm({ onClose, onSave, product, categories = [] }) {
  const [form, setForm] = useState(() => ({ name: '', sku: '', barcode: '', description: '', costPrice: '', price: '', stock: '', minStockAlert: 3, imageUrl: '', ...product,
    categoryId: String(product?.categoryId ?? categories.find((c) => c.name === product?.category)?.id ?? categories[0]?.id ?? '') }));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState('');
  const readerVersion = useRef(0);
  const fileInput = useRef(null);
  useEffect(() => () => { readerVersion.current += 1; }, []);

  const handleChange = ({ target: { name, value } }) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setSaveError('');
  };
  const setImageUrl = (value) => {
    readerVersion.current += 1;
    setReading(false);
    setFileError('');
    if (fileInput.current) fileInput.current.value = '';
    handleChange({ target: { name: 'imageUrl', value } });
  };
  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const version = ++readerVersion.current;
    setFileError('');
    setReading(false);
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFileError('Selecciona una imagen JPG, PNG, WebP o GIF de hasta 5 MB.');
      event.target.value = '';
      return;
    }
    setReading(true);
    try {
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = url;
      await image.decode();
      if (version === readerVersion.current) handleChange({ target: { name: 'imageUrl', value: url } });
    } catch {
      if (version === readerVersion.current) setFileError('No se pudo abrir la imagen. Selecciona otro archivo.');
    } finally { if (version === readerVersion.current) setReading(false); }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || reading) return;
    const nextErrors = validateProduct(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || fileError) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...form, name: form.name.trim(), categoryId: Number(form.categoryId), price: Number(form.price), costPrice: Number(form.costPrice), stock: Number(form.stock), minStockAlert: Number(form.minStockAlert) });
      onClose();
    } catch (error) { setSaveError(error.message || 'No se pudo guardar el producto.'); }
    finally { setSaving(false); }
  };

  const field = (name, label, props = {}) => <InventoryField name={name} label={label} value={form[name]} onChange={handleChange} error={errors[name]} {...props} />;
  const margin = Number(form.price) - Number(form.costPrice);
  return <InventoryModal title={product ? 'Editar producto' : 'Nuevo producto'} onClose={onClose} busy={saving || reading}>
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <fieldset disabled={saving} className="flex min-w-0 flex-col gap-4">
        {field('name', 'Nombre del producto', { required: true })}
        <div className="grid gap-3 sm:grid-cols-2">
          {field('sku', 'SKU', { placeholder: 'URB-001', required: true, pattern: '[A-Z]{2,8}-[0-9]{3,8}', autoCapitalize: 'characters' })}
          {field('barcode', 'Código de barras (opcional)')}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-category" className="text-xs font-semibold">Categoría *</label>
          <select id="product-category" name="categoryId" value={form.categoryId} onChange={handleChange} className={controlClass} aria-invalid={!!errors.categoryId} aria-describedby={errors.categoryId ? 'category-error' : undefined}>
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          {errors.categoryId && <p id="category-error" role="alert" className="text-xs">{errors.categoryId}</p>}
        </div>
        {field('description', 'Descripción (opcional)')}
        <div className="grid gap-3 sm:grid-cols-2">
          {field('costPrice', 'Costo de compra (S/)', { type: 'number', min: '0.01', step: '0.01', required: true })}
          {field('price', 'Precio de venta (S/)', { type: 'number', min: '0.01', step: '0.01', required: true })}
        </div>
        {Number(form.costPrice) > 0 && Number(form.price) > 0 && <p className="rounded-md border border-dashed border-[#1C1C1C]/30 p-3 text-sm">Margen por unidad: <strong>S/ {margin.toFixed(2)}</strong> ({(margin / Number(form.price) * 100).toFixed(1)}%)</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {field('stock', product ? 'Stock' : 'Stock inicial', { type: 'number', min: '0', step: '1', required: true })}
          {field('minStockAlert', 'Umbral de stock bajo', { type: 'number', min: '0', step: '1', required: true })}
        </div>
        <fieldset className="rounded-lg border border-[#1C1C1C]/20 p-3">
          <legend className="px-1 text-xs font-semibold">Imagen del producto (opcional)</legend>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ProductImage src={form.imageUrl} name={form.name || 'Previsualización'} className="h-24 w-24" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <InventoryField label="URL de imagen" type="url" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://ejemplo.com/producto.jpg" error={errors.imageUrl} />
              <label className="flex flex-col gap-1 text-xs font-medium">O selecciona un archivo
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={selectFile} className="w-full text-xs file:mr-2 file:rounded file:border file:border-[#1C1C1C]/30 file:px-2 file:py-1" />
              </label>
              <p className="text-xs">JPG, PNG, WebP o GIF. Máximo 5 MB.</p>
              {reading && <p role="status" className="text-xs">Procesando imagen…</p>}
              {fileError && <p role="alert" className="text-xs font-semibold">{fileError}</p>}
              {(form.imageUrl || fileError) && <InventoryButton secondary onClick={() => setImageUrl('')}>Quitar imagen</InventoryButton>}
            </div>
          </div>
        </fieldset>
      </fieldset>
      {saveError && <p role="alert" className="text-sm font-semibold">{saveError}</p>}
      <div className="flex flex-wrap justify-end gap-3 border-t border-[#1C1C1C]/20 pt-4">
        <InventoryButton secondary onClick={onClose} disabled={saving || reading}>Cancelar</InventoryButton>
        <InventoryButton type="submit" disabled={saving || reading}>{saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Registrar producto'}</InventoryButton>
      </div>
    </form>
  </InventoryModal>;
}

export function ProductFormModal({ isOpen, ...props }) {
  return isOpen ? <ProductForm key={props.product?.id ?? 'new'} {...props} /> : null;
}
