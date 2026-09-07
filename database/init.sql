-- =============================================================================
-- ESQUEMA RELACIONAL TIENDA PRISMA (POSTGRESQL)
-- =============================================================================

-- 0. USUARIOS DEL SISTEMA (Autenticación JWT y Roles: ADMIN / VENDEDOR - RF01/RF02)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VENDEDOR', -- ADMIN, VENDEDOR
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. CATEGORÍAS (Femenina, Urbana, Mascotas)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROVEEDORES (Sección Proveedores)
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20), -- RUC / DNI
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTOS / INVENTARIO
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(50) UNIQUE,                      -- Código de barras EAN/UPC para lector USB (RF06)
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,  -- Para cálculo de márgenes y ganancias
    sale_price NUMERIC(10, 2) NOT NULL,              -- Precio de venta al público
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 3,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CAJA Y ARQUEO DIARIO
CREATE TABLE IF NOT EXISTS cash_registers (
    id SERIAL PRIMARY KEY,
    opened_by VARCHAR(100) NOT NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    initial_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,  -- Sencillo inicial
    expected_cash NUMERIC(10, 2) DEFAULT 0.00,
    counted_cash NUMERIC(10, 2) DEFAULT 0.00,
    cash_difference NUMERIC(10, 2) DEFAULT 0.00,        -- Descuadre (sobrante o faltante)
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',          -- OPEN, CLOSED
    notes TEXT
);

-- 5. VENTAS (Presenciales / POS - Ligadas a Caja y a Inventario)
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    cash_register_id INT REFERENCES cash_registers(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) DEFAULT 'Cliente Mostrador',
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- EFECTIVO, YAPE, PLIN, TARJETA
    cash_given NUMERIC(10, 2) DEFAULT 0.00,
    cash_change NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DETALLE DE VENTAS (Relación Venta -> Producto)
CREATE TABLE IF NOT EXISTS sale_details (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL, -- Snapshot del costo al momento de vender para rentabilidad exacta
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 7. PEDIDOS (Ventas Online / WhatsApp / Messenger con Logística y Courier)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    channel VARCHAR(30) NOT NULL, -- WHATSAPP, MESSENGER, TIENDA_ONLINE
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    reference TEXT,
    courier_company VARCHAR(50),  -- Shalom, Comité 6, Motorizado
    tracking_number VARCHAR(80),
    payment_method VARCHAR(30) NOT NULL, -- YAPE, PLIN, TRANSFERENCIA
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, VERIFIED
    shipping_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00,
    total_products NUMERIC(10, 2) NOT NULL,
    total_order NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP
);

-- 8. DETALLE DE PEDIDOS (Relación Pedido -> Producto)
CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 9. COMPRAS A PROVEEDORES (Reabastecimiento de Inventario)
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50),
    supplier_id INT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS purchase_details (
    id SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 10. MOVIMIENTOS DE KARDEX / INVENTARIO (Traza de Auditoría)
-- Permite saber en todo momento por qué subió o bajó el stock
CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    movement_type VARCHAR(20) NOT NULL, -- ENTRADA_COMPRA, SALIDA_VENTA_POS, SALIDA_PEDIDO, AJUSTE_MANUAL
    quantity INT NOT NULL,               -- Positivo para entradas, negativo para salidas
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reference_id VARCHAR(50),           -- ticket_number, order_code o purchase_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. MOVIMIENTOS FINANCIEROS (Consolidador para el Reporte Financiero)
-- Unifica ventas presenciales, pedidos online, compras a proveedores y gastos de tienda
CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL, -- INGRESO, EGRESO
    category VARCHAR(50) NOT NULL,         -- VENTA_POS, VENTA_ONLINE, COMPRA_MERCADERIA, GASTO_LOGISTICA, GASTO_OPERATIVO
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_id VARCHAR(50),              -- Id de venta, pedido o compra
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DATOS SEMILLA (SEED DATA PARA PRUEBAS)
-- =============================================================================

-- Contraseñas hasheadas con BCrypt (admin123 y vendedor123)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dueña Prisma (Admin)', 'ADMIN'),
('vendedor', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Personal Mostrador', 'VENDEDOR');

INSERT INTO categories (name, description) VALUES
('Femenina', 'Ropa juvenil femenina de temporada'),
('Urbana', 'Moda urbana y streetwear unisex'),
('Mascotas', 'Prendas y accesorios para mascotas');

INSERT INTO suppliers (company_name, contact_name, phone, email, tax_id) VALUES
('Confecciones Textiles Gamarra S.A.C.', 'Jorge Mendoza', '981234567', 'ventas@textilesgamarra.pe', '20601234567'),
('Pet Fashion Perú', 'Carla Dávila', '976543210', 'contacto@petfashion.pe', '20509876543');

INSERT INTO products (sku, barcode, name, description, category_id, supplier_id, cost_price, sale_price, current_stock, min_stock_alert) VALUES
('URB-001', '7751234567890', 'Polera Oversize Urban', 'Algodón reactivo 100%', 2, 1, 38.00, 69.90, 12, 3),
('FEM-002', '7751234567891', 'Vestido Floral Verano', 'Tela chalis suave', 1, 1, 45.00, 89.00, 3, 2),
('PET-003', '7751234567892', 'Capa Impermeable Mascota M', 'Impermeable con forro térmico', 3, 2, 18.00, 35.00, 1, 3),
('URB-004', '7751234567893', 'Jogger Cargo Beige', 'Dril pesado con bolsillos', 2, 1, 42.00, 75.00, 0, 2);
