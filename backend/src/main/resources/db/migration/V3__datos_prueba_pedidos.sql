-- =====================================================================
-- Tienda Prisma — Productos y Variantes Semilla (V3)
-- Convención SKU: URB-### (Urbana), FEM-### (Femenina), PET-### (Mascotas)
-- =====================================================================

-- 1. Productos Iniciales asociados a sus categorías canónicas
INSERT INTO products (id, category_id, name, description, is_active)
SELECT 1, c.id, 'Polera Oversize Streetwear', 'Polera urbana de algodón reactivo 100% franela', true
FROM categories c WHERE c.name = 'Ropa Urbana'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, description, is_active)
SELECT 2, c.id, 'Vestido Casual Floral Primavera', 'Vestido juvenil femenino de corte ligero', true
FROM categories c WHERE c.name = 'Ropa Juvenil Femenina'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, description, is_active)
SELECT 3, c.id, 'Capa Abrigadora Mascotas Polar', 'Capa térmica lavable para perros y gatos medianos', true
FROM categories c WHERE c.name = 'Ropa de Mascotas'
ON CONFLICT (id) DO NOTHING;

-- 2. Variantes de Producto con stock inicial y SKUs canónicos
INSERT INTO product_variants (
    id, product_id, sku, barcode, size_label, color_label, cost_price, sale_price, current_stock, min_stock_alert, is_active, version
) VALUES
(1, 1, 'URB-001', '775001001001', 'M', 'Negro', 35.0000, 69.90, 25, 3, true, 0),
(2, 1, 'URB-002', '775001001002', 'L', 'Blanco', 35.0000, 69.90, 20, 3, true, 0),
(3, 2, 'FEM-001', '775001002001', 'S', 'Azul Marino', 45.0000, 89.90, 15, 3, true, 0),
(4, 3, 'PET-001', '775001003001', 'M', 'Rojo', 18.0000, 39.90, 30, 5, true, 0)
ON CONFLICT (id) DO NOTHING;

-- Ajustar las secuencias de identidad de PostgreSQL para evitar colisiones
SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1)) FROM products;
SELECT setval(pg_get_serial_sequence('product_variants', 'id'), coalesce(max(id), 1)) FROM product_variants;
