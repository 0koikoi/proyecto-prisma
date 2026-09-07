# Distribución de Módulos, Modelo Relacional y Roles (Equipo de 5)

## 1. Definición de Secciones del Sistema de Gestión

A partir de las necesidades del negocio definidas en `plan prisma.md`, el sistema queda estructurado en **6 secciones principales**, con una base de datos relacional completamente conectada:

1. **Dashboard & Configuración:** Panel central con métricas en tiempo real (ventas del día, alertas de stock mínimo, efectivo disponible en gaveta y pedidos por despachar), más administración de usuarios.
2. **Inventario:** Catálogo unificado de productos con SKU corto, código de barras EAN/UPC, categorías (Femenina, Urbana, Mascotas), costo de compra (`cost_price`) y precio de venta.
   - *Relación:* Se descuenta automáticamente al registrar una venta en mostrador o despachar un pedido online. Se incrementa al registrar compras a proveedores. Traza de auditoría en la tabla Kardex (`inventory_movements`).
3. **Caja y Venta (POS):**
   - **Punto de Venta:** Cobro rápido con buscador por nombre/SKU, detector automático de escáner de código de barras USB (modo *keyboard wedge*), selector táctil de medios de pago (Efectivo, Yape, Plin, Tarjetas) y cálculo de vuelto.
   - **Caja:** Apertura de turno con sencillo inicial, registro de movimientos y cierre de caja calculando descuadres (sobrantes o faltantes).
4. **Pedidos (Online y Redes Sociales):**
   - Gestión de órdenes recibidas por WhatsApp, Messenger o la futura tienda online (`ecommerce/`).
   - Seguimiento de estados: *Pendiente*, *En preparación*, *Enviado* (couriers: Shalom, Comité 6, Motorizado local) y *Entregado*.
   - *Relación:* Cada pedido reserva o descuenta el stock de los productos y genera una transacción de ingreso financiero.
5. **Proveedores (Abastecimiento):**
   - Directorio de talleres de confección y distribuidores (Gamarra, Pet Fashion, etc.).
   - Registro de compras y reposiciones de mercadería que alimentan el inventario y registran el costo unitario para calcular ganancias reales.
6. **Reporte Financiero:**
   - Balance integral que unifica:
     - **Ingresos por Ventas Físicas (POS)**
     - **Ingresos por Ventas Online / Pedidos (WhatsApp/Web)**
     - **Egresos por Compras de Mercadería a Proveedores**
   - Cálculo automático de **Margen Bruto (%)**, ganancia neta, libro diario de transacciones y exportación directa a archivo CSV para Microsoft Excel (RF21).

---

## 2. Mapa de Relaciones en la Base de Datos (`database/init.sql`)

```
   [users (ADMIN / VENDEDOR)]
               │
[categories] ──1:N──< [products] >──N:1── [suppliers]
                         │   │
                         │   └──N:1──< [purchase_details] >──N:1── [purchases] (Egresos)
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
[sale_details]                        [order_details]
      │ (Venta Presencial POS)              │ (Venta Online / Courier)
      ▼                                     ▼
   [sales]                               [orders]
      │                                     │
      ├──N:1──> [cash_registers]            └── Registra courier (Shalom / Comité 6)
      │
      └─────────┐                 ┌─────────┘
                ▼                 ▼
        [inventory_movements (Kardex)]
                ▲
                │ Alimenta ingresos y egresos
                ▼
      [financial_transactions] ───> REPORTE FINANCIERO CONSOLIDADO
```

### Script de Base de Datos y Docker
- **Docker Compose:** [`database/docker-compose.yml`](file:///c:/Users/USER/Documents/github/prisma/proyecto-prisma/database/docker-compose.yml) listo para levantar PostgreSQL 16 con `docker compose up -d` (puerto 5432, usuario `prisma_user`, clave `prisma_password`).
- **DDL Relacional:** [`database/init.sql`](file:///c:/Users/USER/Documents/github/prisma/proyecto-prisma/database/init.sql) con 12 tablas creadas, claves foráneas, restricciones de integridad y datos semilla de prueba.

---

## 3. Asignación Oficial de Roles para los 5 Integrantes

| **Zully** | **Líder del Proyecto, Control de Versiones (Git/GitHub), Pedidos & Proveedores** | `feature/orders/`<br>`feature/suppliers/` | `Order.java`<br>`OrderDetail.java`<br>`Supplier.java`<br>`Purchase.java`<br>`PurchaseDetail.java`<br>`OrderController.java`<br>`SupplierController.java` | `orders`, `order_details`, `suppliers`, `purchases`, `purchase_details` |
| **Keila** | **Dashboard, Autenticación (JWT) & Configuración** | `feature/dashboard/`<br>`feature/auth/`<br>`feature/settings/`<br>`core/` y `shared/` | `User.java`<br>`UserRepository.java`<br>`AuthController.java`<br>`DashboardController.java`<br>`CorsConfig.java` | `users` |
| **Mauricio** | **Inventario & Categorías** | `feature/inventory/` | `Product.java`<br>`Category.java`<br>`CategoryRepository.java`<br>`ProductRepository.java`<br>`ProductController.java`<br>`CategoryController.java` | `products`, `categories`, `inventory_movements` |
| **Leo** | **Punto de Venta (POS) & Caja** | `feature/pos/`<br>`feature/cash-register/` | `CashRegister.java`<br>`Sale.java`<br>`SaleDetail.java`<br>`CashRegisterController.java`<br>`SaleController.java` | `sales`, `sale_details`, `cash_registers` |
| **Meli** | **Reporte Financiero & Rentabilidad** | `feature/financial-reports/` | `FinancialTransaction.java`<br>`FinancialTransactionRepository.java`<br>`FinancialController.java` | `financial_transactions` |

---

## 4. Estado de Verificación del Proyecto

- **Frontend:** Compilación con Vite verificada (`npm run build` genera bundle sin errores).
- **Backend:** Compilación con Maven verificada (`mvnw compile` y `mvnw test-compile` con Java 25 completados con BUILD SUCCESS).
- **Base de Datos:** `database/init.sql` contiene las 12 entidades con claves foráneas, restricciones de chequeo y datos semilla de prueba.
