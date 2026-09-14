# Plan de Implementación: Sistema de Backoffice — Tienda Prisma

> **Alcance:** este plan cubre únicamente la **web de gestión interna** (inventario, ventas/POS, caja, pedidos, proveedores). El **e-commerce** (tipo Shein) tendrá su **propio plan de implementación**, se desarrollará **después** de este sistema, y se conectará a él reutilizando el mismo catálogo de productos (ver sección "Relación con el e-commerce").

---

## 1. Preguntas abiertas / pendientes de confirmar con el cliente

| # | Tema | Detalle | Supuesto aplicado mientras se confirma |
|---|------|---------|------------------------------------------|
| 1 | Reporte financiero | En la imagen de asignación de roles aparece "reporte financiero → Meli" como si fuera un módulo aparte, pero no se detalló en el alcance original. | Se integra como una pestaña de **Reportes** dentro del Dashboard (ventas por rango de fechas, por categoría, exportable a Excel/CSV), sin crear un módulo independiente. Confirmar si se requiere algo más (ej. estado de resultados, márgenes). |
| 2 | Órdenes de compra a proveedores | La entrevista menciona reposición de stock cada 2 semanas o al agotarse, pero no un flujo formal de "orden de compra". | El módulo de Proveedores incluirá solo **registro de proveedor** (datos de contacto, productos que provee) y un **historial simple de reposiciones**, no una orden de compra con aprobación/estados. Confirmar si se necesita algo más elaborado. |
| 3 | Modelo del lector de código de barras | Se confirmó incluir soporte para lector de código de barras, pero falta saber si el negocio ya tiene un lector físico o si hay que recomendarlo/presupuestarlo. | Se diseña para el estándar de mercado (lector USB en modo *keyboard wedge / HID*, sin necesidad de driver ni SDK — ver sección 5). Si el negocio no tiene uno, cualquier lector USB económico con este modo es compatible. |
| 4 | Ambiente de despliegue final | No se especificó dónde quedará alojado el sistema en producción (VPS propio, PaaS, etc.). | Se asume Docker Compose para desarrollo local y un contenedor único desplegable en cualquier proveedor (Railway, Render, VPS) para el backend + frontend, conectado a la base de datos PostgreSQL gestionada en Neon ya definida como stack. |

---

## 2. Resumen del producto

- **Cliente:** Tienda Prisma (Huánuco) — ropa juvenil femenina, ropa urbana y ropa de mascotas. Tienda física + ventas por Instagram/WhatsApp.
- **Problema principal a resolver (según entrevista de descubrimiento):** el control de inventario, ventas y caja se lleva hoy en Excel de forma manual, generando errores de stock (ventas de productos ya agotados) y trabajo repetitivo mes a mes.
- **Producto:** backoffice web (Punto de Venta + Inventario + Caja + Pedidos + Proveedores + Dashboard).
- **Diseño:** minimalista, blanco y negro.
- **Roles del sistema:** `ADMIN` (dueña de la tienda, acceso total) y `VENDEDOR` (operación de POS y caja, sin acceso a reportes financieros ni configuración).

### 2.1 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + **Tailwind CSS** |
| Backend | Spring Boot (Java) |
| Base de datos | PostgreSQL (Neon) |
| Contenerización | Docker + Docker Compose |
| Autenticación | Spring Security + JWT |

### 2.2 Equipo

| Módulo / Función | Responsable |
|------------------|-------------|
| **Liderazgo de Proyecto & Git** | **Zully (Líder)** |
| Pedidos y Logística | Zully |
| Proveedores y Abastecimiento | Zully |
| Inventario y Categorías | Mauricio |
| Dashboard, Auth & Configuración | Keila |
| Caja y Venta (POS) | Leo |
| Reportes Financieros | Meli |

---

## 3. Relación con el e-commerce (fuera de este alcance)

- Este backoffice se construye **primero** y de forma **independiente**.
- El modelo de datos de `Product` y `Category` se diseña pensando en que luego será **consumido también por el e-commerce** (mismas imágenes, precios, stock, SKU), evitando duplicar catálogo entre ambos sistemas.
- El backend expondrá los endpoints de catálogo (`/api/products`, `/api/categories`) de forma que, en el plan de implementación del e-commerce, ese proyecto solo necesite **consumir la misma API o la misma base de datos**, en lugar de crear su propio inventario.
- Venta física (POS) y venta online (e-commerce, a futuro) descontarán del **mismo stock**, evitando el problema que la clienta describió de ofrecer productos ya vendidos.

---

## 4. Vistas del sistema

| Vista | Rol de acceso | Descripción |
|-------|---------------|-------------|
| **Login** | Todos | Autenticación con JWT. |
| **Dashboard / Reportes** | Admin (Vendedor ve versión reducida) | Ventas del día, alertas de stock bajo, reportes por rango de fechas y categoría, exportación CSV/Excel. |
| **Inventario** | Admin, Vendedor (solo lectura) | CRUD de productos y categorías, carga de imagen, SKU corto, código de barras, stock. |
| **POS (Punto de Venta)** | Admin, Vendedor | Buscador visual por categoría + búsqueda por texto/SKU + lectura de código de barras. Ticket virtual, selección de método de pago. |
| **Caja** | Admin, Vendedor | Apertura de caja (saldo inicial), registro de movimientos por método de pago, cierre con cuadre. |
| **Pedidos** | Admin, Vendedor | Seguimiento de pedidos recibidos por Instagram/WhatsApp: datos del cliente, dirección, referencia, método de pago, courier (Shalom / comité 6), estado (pendiente → preparación → enviado → entregado). |
| **Proveedores** | Admin | Registro de proveedores y qué productos abastecen; historial simple de reposiciones de stock. |
| **Configuración** | Admin | Gestión de usuarios (Admin/Vendedor), categorías del negocio. |

---

## 5. Requisitos funcionales por módulo

### 5.1 Autenticación y roles
- RF01: El sistema permite login con usuario y contraseña, emitiendo un token JWT.
- RF02: El sistema restringe vistas y acciones según el rol (`ADMIN`, `VENDEDOR`).

### 5.2 Inventario
- RF03: CRUD de productos (nombre, descripción, precio, SKU corto, código de barras, stock, imagen, categoría).
- RF04: CRUD de categorías (femenina, urbana, mascotas — configurable a futuro).
- RF05: Alerta visual cuando el stock de un producto cae debajo de un umbral configurable.
- RF06: Cada producto puede tener un **código de barras** asociado (generado o ingresado manualmente) además de su SKU corto.

### 5.3 POS (Punto de Venta)
- RF07: Panel de búsqueda visual por categoría (imágenes + botones) y buscador por texto/SKU.
- RF08: **Lectura de código de barras**: un campo de captura recibe la entrada del lector USB (que funciona como teclado, modo *keyboard wedge/HID*, sin driver adicional) y agrega automáticamente el producto al ticket al detectar el patrón de tecleo rápido + Enter propio de un escaneo, sin necesidad de que el usuario haga clic en el campo primero.
- RF09: Ticket virtual editable (cantidad, quitar producto) con cálculo automático del total.
- RF10: Selección de método de pago (Efectivo, Yape, Plin) al cerrar la venta.
- RF11: Al confirmar una venta, el sistema descuenta el stock correspondiente de forma transaccional y **no permite** vender más unidades de las disponibles.

### 5.4 Caja
- RF12: Apertura de caja diaria con registro de saldo inicial (sencillo).
- RF13: Registro automático de cada venta según su método de pago.
- RF14: Cierre de caja: el sistema calcula el saldo esperado en efectivo (inicial + ventas en efectivo) y permite ingresar el conteo físico real, mostrando la diferencia (faltante/sobrante).

### 5.5 Pedidos
- RF15: Registro de pedido con datos del cliente (nombre, teléfono, dirección, referencia), productos, método de pago y courier.
- RF16: Estados del pedido: `Pendiente → En preparación → Enviado → Entregado`.
- RF17: Campo para adjuntar/registrar evidencia de envío (foto del paquete, datos de conductor/placa cuando aplica comité 6).

### 5.6 Proveedores
- RF18: CRUD de proveedores (nombre, contacto, productos que abastece).
- RF19: Registro de reposiciones de stock asociadas a un proveedor (fecha, producto, cantidad).

### 5.7 Dashboard / Reportes
- RF20: Métricas del día: total vendido, número de ventas, productos con stock bajo.
- RF21: Reporte de ventas filtrable por rango de fechas y categoría, exportable a CSV/Excel.

### 5.8 No funcionales
- RNF01: Interfaz minimalista en blanco y negro, responsive (uso en laptop y tablet en el mostrador).
- RNF02: Tiempo de respuesta del buscador del POS y del escaneo debe sentirse inmediato (uso en mostrador con clientes esperando).
- RNF03: Todo el sistema (frontend + backend) corre en contenedores Docker; la base de datos de producción es PostgreSQL gestionado en Neon.
- RNF04: Las contraseñas se almacenan con hash (BCrypt), nunca en texto plano.

---

## 6. Arquitectura

```
┌──────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│  Frontend         │ ───────────────────────▶ │  Backend              │
│  React + Vite      │                          │  Spring Boot (API)    │
│  Tailwind CSS       │ ◀─────────────────────── │  Spring Security/JWT  │
│  (contenedor Nginx) │                          │  (contenedor Java)    │
└──────────────────┘                          └──────────┬───────────┘
                                                            │ JDBC
                                                            ▼
                                                  ┌────────────────────┐
                                                  │ PostgreSQL (Neon)   │
                                                  │ gestionado en la nube│
                                                  └────────────────────┘
```

- **Docker Compose (desarrollo local):** contenedor `frontend`, contenedor `backend`, y un contenedor `postgres` local para no depender de conexión a internet mientras se desarrolla.
- **Producción:** el contenedor `backend` se conecta directamente a la instancia de **Neon** (no se conteneriza la base de datos en producción, ya que Neon es un servicio gestionado); el contenedor `frontend` sirve el build estático vía Nginx.
- **Migraciones de base de datos:** se recomienda usar **Flyway** (se integra de forma nativa con Spring Boot) para versionar el esquema en lugar de crear las tablas manualmente.

### 6.1 Entidades principales

- `User` (usuario del sistema: admin/vendedor)
- `Category`
- `Product` (incluye `barcode` y `skuCorto`)
- `Sale` / `SaleDetail`
- `CashRegister` (apertura/cierre de caja)
- `Order` (pedido) / `OrderStatus`
- `Supplier` (proveedor) / `RestockRecord`

---

## 7. Plan de sprints (metodología Scrum)

**Duración total:** 16 semanas, en **8 sprints de 2 semanas** cada uno.

> Nota sobre el orden solicitado (frontend → base de datos → backend): es un orden poco habitual, porque normalmente el contrato de datos (entidades y API) se define antes de construir las pantallas, para no rehacer el frontend cuando cambie el backend. Para respetar el orden pedido sin ese riesgo, el **Sprint 1** define primero el contrato de la API (qué datos entrega cada endpoint) y el frontend se construye en los Sprints 2-4 **contra datos simulados (mocks)** que cumplen ese contrato. Así, cuando el backend real esté listo (Sprints 6-7), solo se reemplaza el mock por la llamada real, sin rediseñar pantallas.

| Sprint | Semanas | Objetivo (Sprint Goal) | Entregables |
|--------|---------|------------------------|-------------|
| **1** | 1-2 | Definir base del proyecto | Wireframes en blanco y negro de las 8 vistas; contrato de API (endpoints y forma de las respuestas); esqueleto de repos (React+Vite+Tailwind / Spring Boot); Docker Compose base. |
| **2** | 3-4 | Frontend: Login, Dashboard y Layout | Pantalla de login, layout con sidebar, Dashboard con métricas simuladas. |
| **3** | 5-6 | Frontend: Inventario y POS | CRUD visual de Inventario (mock), pantalla POS con buscador visual + campo de captura de código de barras (mock). |
| **4** | 7-8 | Frontend: Caja, Pedidos y Proveedores | Pantallas de apertura/cierre de caja, tablero de Pedidos por estado, CRUD de Proveedores (todo con datos simulados). |
| **5** | 9-10 | Base de datos | Modelado de entidades y relaciones, migraciones con Flyway, base de datos PostgreSQL levantada en Neon (y en contenedor local para desarrollo), datos semilla. |
| **6** | 11-12 | Backend: Autenticación e Inventario | Spring Security + JWT, endpoints de Productos/Categorías, alertas de stock bajo. |
| **7** | 13-14 | Backend: Ventas, Caja, Pedidos, Proveedores | Endpoint transaccional de venta (descuenta stock, valida stock negativo), apertura/cierre de caja, CRUD de Pedidos y Proveedores. |
| **8** | 15-16 | Integración y cierre | Conexión del frontend a la API real (reemplazo de mocks), pruebas manuales del flujo completo de un día de tienda, dockerización final, despliegue. |

---

## 8. Historias de usuario

### Epic: Autenticación
- **HU01.** Como usuaria administradora, quiero iniciar sesión con usuario y contraseña, para acceder solo yo y mi personal autorizado al sistema.
  - *Criterios de aceptación:* login rechaza credenciales inválidas; el token expira tras un tiempo definido.
- **HU02.** Como administradora, quiero que el vendedor no vea los reportes financieros, para proteger información sensible del negocio.

### Epic: Inventario
- **HU03.** Como administradora, quiero registrar un producto nuevo con su categoría, precio, stock, SKU corto y código de barras, para tenerlo disponible en el catálogo y en el POS.
- **HU04.** Como administradora, quiero ver una alerta cuando un producto tenga poco stock, para reponerlo a tiempo.
- **HU05.** Como administradora, quiero editar o dar de baja un producto, para mantener el catálogo actualizado.

### Epic: POS / Venta
- **HU06.** Como vendedora, quiero buscar un producto por categoría con imágenes o escribiendo su nombre/SKU, para agregarlo rápido a la venta cuando no tengo lector.
- **HU07.** Como vendedora, quiero escanear el código de barras de un producto con el lector USB, para agregarlo al ticket sin buscarlo manualmente.
- **HU08.** Como vendedora, quiero elegir el método de pago (efectivo, Yape, Plin) al cerrar la venta, para que quede registrado correctamente en caja.
- **HU09.** Como vendedora, quiero que el sistema me impida vender un producto sin stock, para no prometer algo que ya no tengo (problema reportado en la entrevista).

### Epic: Caja
- **HU10.** Como vendedora, quiero abrir la caja registrando el saldo inicial en efectivo, para empezar el día con el sencillo controlado.
- **HU11.** Como administradora, quiero cerrar la caja y ver la diferencia entre lo esperado y lo contado, para detectar faltantes o sobrantes.

### Epic: Pedidos
- **HU12.** Como vendedora, quiero registrar un pedido recibido por WhatsApp/Instagram con los datos del cliente y el courier, para no perder esa información fuera del sistema.
- **HU13.** Como vendedora, quiero actualizar el estado de un pedido (preparación, enviado, entregado), para hacer seguimiento sin depender de la memoria o los chats.

### Epic: Proveedores
- **HU14.** Como administradora, quiero registrar mis proveedores y qué productos me abastecen, para saber a quién contactar cuando un producto se agota.
- **HU15.** Como administradora, quiero registrar cuándo repongo stock de un producto, para tener un historial de reposiciones.

### Epic: Dashboard / Reportes
- **HU16.** Como administradora, quiero ver cuánto vendí hoy y qué productos tienen poco stock apenas entro al sistema, para tomar decisiones rápidas.
- **HU17.** Como administradora, quiero exportar un reporte de ventas por rango de fechas, para revisar mi mes sin tener que armarlo manualmente en Excel (tarea que hoy le quita más tiempo, según la entrevista).

---

## 9. Plan de verificación

### Pruebas automatizadas
- `mvn test`: pruebas unitarias y de integración sobre los casos de uso, verificando que:
  - al registrar una venta, el stock del producto disminuye correctamente;
  - no se permite una venta si el stock es insuficiente;
  - el cierre de caja calcula correctamente la diferencia entre saldo esperado y saldo contado.

### Pruebas manuales (flujo de un día de tienda)
1. Levantar los contenedores (`docker compose up`).
2. Abrir caja con un saldo inicial de prueba.
3. En el POS, agregar un producto escaneando su código de barras y otro buscándolo por texto; cerrar la venta pagando con Yape.
4. Verificar en Inventario que el stock de ambos productos disminuyó.
5. Registrar un pedido de prueba recibido por WhatsApp y avanzarlo por sus estados.
6. Registrar una reposición de stock desde el módulo de Proveedores.
7. Cerrar caja y confirmar que el cuadre coincide con lo vendido en efectivo.
8. Revisar el Dashboard y exportar el reporte de ventas del día.
