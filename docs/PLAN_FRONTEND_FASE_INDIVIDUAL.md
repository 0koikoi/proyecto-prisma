# Plan de Desarrollo Frontend: Fase de Ejecución Individual — Tienda Prisma

> **Destinatarios:** Equipo de Desarrollo Frontend (Keila, Mauricio, Leo, Zully, Meli)  
> **Objetivo:** Guía operativa detallada con el estado actual del proyecto, tareas pendientes por módulo, buenas prácticas y plan de trabajo para el desarrollo individual de cada integrante.

---

## 1. Informe de Estado Actual: Lo que está Hecho y Validado

### A. Arquitectura y Configuración Base
- **Stack Consolidado:** React 19 + Vite + Tailwind CSS v4 (`@layer components` en `src/index.css`) + React Router v7 + Lucide React.
- **Enrutamiento y Control de Acceso (RBAC):** `App.jsx`, `AppRoutes.jsx` y `ProtectedRoute.jsx` implementados con validación de roles (`ADMIN` vs `VENDEDOR`).
- **Sidebar Dinámico:** `Sidebar.jsx` oculta automáticamente los módulos sensibles (*Reporte Financiero* y *Configuración*) cuando un usuario tiene rol de `VENDEDOR` (cumpliendo HU02 / RF02).
- **Cliente HTTP Centralizado:** `apiClient.js` configurado con inyección automática de cabeceras `Authorization: Bearer <token>`, soporte para verbos REST (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) y captura de respuestas 401.
- **Base de Datos y Backend:** Esquema relacional con 12 tablas en `database/init.sql` (incluyendo `users` y columna `barcode` en `products`), credenciales sincronizadas en `database/docker-compose.yml` y `backend/src/main/resources/application.properties`, y 40 clases Java compilando exitosamente con Java 25.

### B. Vistas y Componentes Base Estructurados (con Tailwind)
- **Dashboard:** Tarjetas de KPI principales (`MetricCard`), accesos rápidos y contenedor para gráficos.
- **Inventario:** Tabla de productos con estado de stock bajo, badges visuales, columna con código EAN y modal para crear/editar productos (`ProductFormModal`).
- **POS (Punto de Venta):** Interfaz dividida con catálogo táctil (`ProductGrid`), ticket virtual editable (`CartTicket`), modal de cobro con cálculo de vuelto (`PaymentModal`) y detector en memoria de pulsaciones de escáner USB (*keyboard wedge*).
- **Caja:** Tablero de resumen de ventas por método de pago y modales de apertura (`CashOpenModal`) y arqueo de cierre con cálculo reactivo de descuadre (`CashCloseModal`).
- **Pedidos:** Tablero con badges de courier (Shalom, Comité 6) y canales (WhatsApp, Web), con selectores de cambio de estado en tiempo real (`OrdersTable`).
- **Proveedores:** Directorio de talleres textiles y distribuidores con enlaces telefónicos y correo (`SuppliersTable`).
- **Reporte Financiero:** Balance con cálculo de margen bruto (%), selector de rango de fechas y exportación real a archivo CSV descargable para Microsoft Excel.
- **Autenticación & Configuración:** Pantallas base de Login institucional (`LoginPage`) y Configuración de parámetros (`SettingsPage`).

---

## 2. Lo que Falta Implementar en el Frontend (Por Integrante)

Cada desarrollador debe enfocarse en su respectivo módulo en `frontend/src/feature/`:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             EQUIPO DE 5 INTEGRANTES                        │
├──────────────┬─────────────────────────┬───────────────────────────────────┤
│ Integrante   │ Módulo Frontend         │ Alcance de la Fase Individual     │
├──────────────┼─────────────────────────┼───────────────────────────────────┤
│ **Zully**    │ Líder del Proyecto,     │ Pedidos, proveedores, control de  │
│ (Líder)      │ Pedidos y Proveedores   │ versiones (Git), aprobación PRs   │
├──────────────┼─────────────────────────┼───────────────────────────────────┤
│ **Keila**    │ Dashboard, Auth, Config │ Gráficos interactivos, JWT real   │
│ **Mauricio** │ Inventario              │ Imágenes, filtros avanzados, CRUD │
│ **Leo**      │ POS & Caja              │ Lector físico USB, ticket térmico │
│ **Meli**     │ Reporte Financiero      │ Filtro dinámico y libro diario    │
└──────────────┴─────────────────────────┴───────────────────────────────────┘
```

---

### 2.1. Keila — Dashboard, Autenticación y Configuración
**Archivos:** `feature/dashboard/`, `feature/auth/`, `feature/settings/`, `core/`

1. **Instalación de Librería de Gráficos:**
   - Instalar `recharts` (`npm install recharts`) para renderizar el gráfico de tendencia semanal (`LineChart`) y el gráfico de dona por categoría (`PieChart`).
2. **Dashboard Visual (RF20):**
   - Reemplazar los marcadores punteados de `DashboardPage.jsx` por los componentes de gráficos alimentados por `dashboardService.js`.
   - Implementar vista condicional: el rol `VENDEDOR` solo debe ver las ventas y pedidos del día, sin métricas de costo ni ganancia bruta.
3. **Autenticación con JWT (RF01):**
   - En `LoginPage.jsx`, conectar el formulario para almacenar el token en `localStorage.setItem('token', token)` y los datos en `localStorage.setItem('user', JSON.stringify(user))`.
   - Implementar temporizador o verificación de expiración de sesión en `AuthContext.jsx`.
4. **Módulo de Configuración (`SettingsPage.jsx`):**
   - Implementar pestaña de **Gestión de Personal**: tabla de usuarios registrados (Admin/Vendedor) con modal para crear nuevo personal y resetear contraseñas.
   - Implementar pestaña de **Datos de la Tienda**: razón social, teléfono de contacto y dirección física en Huánuco.

---

### 2.2. Mauricio — Inventario y Categorías
**Archivos:** `feature/inventory/`

1. **Carga y Previsualización de Imágenes:**
   - En `ProductFormModal.jsx`, agregar campo de URL de imagen o selector de archivo con previsualización en miniatura.
2. **Validaciones de Formulario:**
   - Validar que `costPrice` y `price` sean números positivos mayores a 0, y que `price > costPrice` para garantizar margen positivo.
   - Validar que el SKU no contenga espacios y tenga formato estandarizado (ej. `URB-001`).
3. **Gestión de Categorías:**
   - Agregar botón y modal para crear o editar categorías (Femenina, Urbana, Mascotas, etc.) consumiendo `inventoryService.getCategories()`.
4. **Filtro de Stock Bajo y Paginación:**
   - Agregar checkbox "Solo productos con stock bajo" en la barra de filtros de `InventoryPage.jsx`.
   - Implementar paginación simple (10 o 20 productos por página) para evitar tablas excesivamente largas.

---

### 2.3. Leo — Punto de Venta (POS) y Caja
**Archivos:** `feature/pos/`, `feature/cash-register/`

1. **Ajuste del Lector de Código de Barras USB (RF08):**
   - Probar el hook `usePos.js` con un escáner USB físico en el mostrador para calibrar el umbral de detección de teclas (entre 40ms y 70ms).
   - Agregar un indicador visual discreto en la barra del POS que muestre si el escáner está listo para recibir lecturas.
2. **Emisión de Comprobante / Ticket:**
   - Al confirmar la venta en `PaymentModal.jsx`, mostrar una ventana modal con el ticket de venta formateado (estilo ticketera térmica de 80mm o 58mm) con opción de imprimir (`window.print()`).
3. **Control de Apertura Obligatoria:**
   - En `PosPage.jsx`, verificar si `cashStatus.isOpen === false`; de ser así, deshabilitar el botón de cobro y mostrar alerta: *"Debe abrir el turno de caja antes de registrar ventas"*.
4. **Desglose de Billetes y Monedas en Arqueo:**
   - En `CashCloseModal.jsx`, agregar una calculadora opcional de billetes (S/ 100, 50, 20, 10) y monedas (S/ 5, 2, 1) para facilitar el conteo del efectivo en gaveta al final del día.

---

### 2.4. Zully — Pedidos y Proveedores
**Archivos:** `feature/orders/`, `feature/suppliers/`

1. **Modal de Registro de Nuevo Pedido Manual:**
   - Crear `OrderFormModal.jsx` en `feature/orders/components/` para registrar pedidos recibidos por WhatsApp/Messenger:
     - Datos del cliente: Nombre, Teléfono, Dirección exacta, Referencia.
     - Selección de Courier: Shalom (con campo de guía), Comité 6 (con campo de placa/conductor) o Motorizado Local.
     - Selector de productos del catálogo y cálculo automático del total + costo de envío.
2. **Acción Rápida de WhatsApp:**
   - En `OrdersTable.jsx`, agregar botón con icono de WhatsApp junto al teléfono que abra el chat con mensaje predeterminado: `https://wa.me/51987654321?text=Hola%20Lucía,%20tu%20pedido%20de%20Tienda%20Prisma%20está%20en%20camino...`
3. **Modal de Nuevo Proveedor y Edición:**
   - Crear `SupplierFormModal.jsx` en `feature/suppliers/components/` con campos: Razón Social, Contacto, Teléfono, Correo, RUC y Línea de producto.
4. **Modal de Reposición de Stock (RF19):**
   - Crear `RestockModal.jsx` para registrar compras de mercadería:
     - Seleccionar proveedor.
     - Seleccionar producto del catálogo.
     - Ingresar cantidad comprada y costo unitario de compra (`costPrice`).
     - Al guardar, llamar a `suppliersService.registerRestock()` para actualizar automáticamente el stock disponible.

---

### 2.5. Meli — Reportes Financieros y Rentabilidad
**Archivos:** `feature/financial-reports/`

1. **Filtro Reactivo por Fechas:**
   - En `FinancialReportsPage.jsx`, conectar los inputs `dateFrom` y `dateTo` para que al hacer clic en "Aplicar Filtro", se envíen las fechas a `financialService.getFinancialReport({ startDate, endDate })`.
2. **Gráfico Comparativo de Canales de Ingreso:**
   - Agregar un gráfico de barras comparativo: Ventas Físicas en Mostrador (POS) vs Ventas Online (Pedidos por WhatsApp/Web).
3. **Filtros por Tipo de Transacción en Libro Diario:**
   - En la tabla de transacciones de `FinancialReportsPage.jsx`, agregar filtros para ver: *Todas*, *Solo Ingresos (Ventas)* o *Solo Egresos (Compras de mercadería)*.
4. **Verificación de Fórmulas Financieras:**
   - Asegurar que la pantalla muestre claramente:
     - **Utilidad Bruta:** `Ingresos Totales - Costo de Mercadería Vendida (COGS)`.
     - **Margen Bruto:** `(Utilidad Bruta / Ingresos Totales) * 100`.

---

## 3. Guía de Trabajo y Buenas Prácticas para los 5 Integrantes

1. **Liderazgo y Control de Versiones (Zully):**
   - **Zully** es la **Líder del Proyecto**, administradora del repositorio y responsable del control de versiones (Git/GitHub) y seguimiento de los avances.
   - Todo Pull Request (PR) hacia las ramas `develop` o `main` debe ser revisado y aprobado por Zully.
   - Cualquier incorporación de dependencias en `package.json` o ajuste en archivos compartidos (`App.jsx`, `index.css`) debe ser coordinado previamente con Zully.

2. **Estrategia de Ramas (GitHub Flow):**
   - Nadie realiza commits directos a `main` ni a `develop`.
   - Cada integrante clona el repositorio y trabaja en su rama oficial asignada:
     - `feature/pedidos-proveedores` (Zully — Pedidos & Proveedores)
     - `feature/dashboard-auth` (Keila — Dashboard & Autenticación)
     - `feature/inventario-mercaderia` (Mauricio — Inventario & Categorías)
     - `feature/punto-venta-caja` (Leo — POS & Caja)
     - `feature/reporte-financiero` (Meli — Reportes Financieros & Rentabilidad)
   - Al completar sus tareas, abren un Pull Request (PR) apuntando hacia `develop` para revisión de Zully.

3. **Estilos con Tailwind CSS:**
   - No escribir CSS tradicional en archivos `.css`. Utilizar las clases utilitarias de Tailwind o las clases semánticas ya definidas en `src/index.css` (`.content-card`, `.btn`, `.btn-primary`, `.badge`, `.custom-table`, `.input-wrapper`).

4. **Validación Continua:**
   - Antes de abrir un Pull Request hacia `develop`, ejecutar siempre:
     ```bash
     npm run build
     ```
   - Si el build muestra algún error de importación o sintaxis, resolverlo de inmediato.

5. **Modo Mock vs Modo Backend Real:**
   - Durante las primeras semanas, cada integrante trabaja con su archivo de servicio mock (`services/`). Cuando el backend Spring Boot esté levantado en el Sprint 6-7, solo deben descomentar la línea de llamada a `apiClient` sin tocar el diseño visual de los componentes.
