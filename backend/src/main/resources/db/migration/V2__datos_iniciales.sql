-- =====================================================================
-- Tienda Prisma — Datos Iniciales / Semilla (V2)
-- =====================================================================

-- 1. Categorías Canónicas Base (RF04)
INSERT INTO categories (name, description, is_active) VALUES
('Ropa Juvenil Femenina', 'Prendas y vestidos juveniles para damas', true),
('Ropa Urbana', 'Prendas de estilo urbano, poleras y streetwear', true),
('Ropa de Mascotas', 'Prendas y accesorios exclusivos para mascotas', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Usuario Administrador Inicial (RF01, RF22)
-- Contraseña temporal por defecto: 'admin123' (Cifrada con BCrypt 10 rounds)
-- Se recomienda cambiarla en el primer inicio de sesión.
INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Administrador General', 'ADMIN', true)
ON CONFLICT DO NOTHING;
