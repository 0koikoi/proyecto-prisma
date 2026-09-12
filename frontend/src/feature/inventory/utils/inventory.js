export const SKU_PATTERN = /^[A-Z]{2,8}-\d{3,8}$/;

export const isLowStock = (product) =>
  Number(product.stock) <= Number(product.minStockAlert ?? 3);

export function validateProduct(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Ingresa el nombre del producto.';
  if (!SKU_PATTERN.test(form.sku ?? '')) {
    errors.sku = 'Usa de 2 a 8 letras mayúsculas, un guion y de 3 a 8 números, sin espacios. Ej.: URB-001.';
  }
  const cost = Number(form.costPrice);
  const price = Number(form.price);
  if (!Number.isFinite(cost) || cost <= 0) errors.costPrice = 'El costo debe ser mayor que 0.';
  if (!Number.isFinite(price) || price <= 0) errors.price = 'El precio debe ser mayor que 0.';
  else if (Number.isFinite(cost) && price <= cost) errors.price = 'El precio debe ser mayor que el costo de compra.';
  for (const field of ['stock', 'minStockAlert']) {
    if (String(form[field] ?? '').trim() === '' || !Number.isInteger(Number(form[field])) || Number(form[field]) < 0) {
      errors[field] = 'Ingresa un número entero igual o mayor que 0.';
    }
  }
  if (!form.categoryId) errors.categoryId = 'Selecciona una categoría.';
  if (form.imageUrl && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(form.imageUrl)) {
    try {
      const url = new URL(form.imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      errors.imageUrl = 'Ingresa una URL completa que empiece con https:// o http://.';
    }
  }
  return errors;
}
