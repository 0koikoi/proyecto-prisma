# Tienda Prisma — Sistema de Gestión Comercial y Backoffice

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)

> **Plataforma web integral de gestión comercial, control de inventario, punto de venta (POS), caja y finanzas para Tienda Prisma (Huánuco, Perú).**

🔗 **Demo en línea:** [https://0koikoi.github.io/proyecto-prisma/](https://0koikoi.github.io/proyecto-prisma/)

---

## 📌 1. Acerca del Proyecto

**Tienda Prisma** es un emprendimiento de moda ubicado en Huánuco que opera a través de dos canales principales: **tienda física** y ventas por **redes sociales** (Instagram, WhatsApp). Cuenta con tres líneas de negocio especializadas:
- 👗 **Moda Femenina:** Ropa juvenil de tendencia.
- 🛹 **Moda Urbana:** Prendas unisex y streetwear.
- 🐾 **Mascotas:** Ropa y accesorios para perros y gatos.

### Problemática que Resuelve
Históricamente, el control de ventas, inventario y caja se realizaba en hojas de cálculo de Excel manuales, ocasionando:
1. **Descuadres de stock:** Ventas de prendas ya agotadas a través de redes sociales.
2. **Falta de trazabilidad:** Ausencia de registro entre compras a talleres de confección y precio de costo unitario.
3. **Pérdida de tiempo:** Registro manual repetitivo en los cierres de caja diarios y balance de fin de mes.

Este sistema centraliza la operación física y digital en una sola plataforma en tiempo real, garantizando sincronización de inventario, cobro ágil en caja y cálculo automático de rentabilidad.

---

## 👥 2. Equipo de Desarrollo y Distribución de Roles

| Integrante | Rol en el Equipo | Módulo Asignado | Rama Git Oficial | Clases / Componentes Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Zully (Tatiana Tello)** | **Líder de Proyecto & Control de Versiones** | **Pedidos, Proveedores & Coordinación Git** | `feature/pedidos-proveedores` | `OrdersPage`, `SuppliersPage`, `Order.java`, `Supplier.java`, `Purchase.java` |
| **Keila** | **Arquitectura Frontend, Auth & Dashboard** | **Dashboard, Autenticación (JWT) & Configuración** | `feature/dashboard-auth` | `DashboardPage`, `LoginPage`, `SettingsPage`, `User.java`, `AuthController.java` |
| **Mauricio** | **Gestión de Mercadería** | **Inventario, Productos & Categorías** | `feature/inventario-mercaderia` | `InventoryPage`, `Product.java`, `Category.java`, `inventoryService.js` |
| **Leo** | **Operaciones en Tienda** | **Punto de Venta (POS) & Arqueo de Caja** | `feature/punto-venta-caja` | `PosPage`, `CashRegisterPage`, `Sale.java`, `CashRegister.java`, `usePos.js` |
| **Meli** | **Análisis Contable** | **Reporte Financiero & Rentabilidad** | `feature/reporte-financiero` | `FinancialReportsPage`, `FinancialTransaction.java`, exportador CSV |

---

## 🏛️ 3. Arquitectura del Repositorio (Monorepo)

```
proyecto-prisma/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD automatizado para despliegue en GitHub Pages
├── backend/                      # API REST construida con Spring Boot 4.1 y Java 25
│   ├── src/main/java/com/prisma/api/
│   │   ├── domain/               # Entidades JPA (Product, Sale, Order, etc.) y Repositorios
│   │   └── infrastructure/       # Controladores REST, Configuración CORS y Seguridad
│   ├── pom.xml                   # Gestión de dependencias Maven
│   └── README.md                 # Documentación técnica del backend
├── database/                     # Capa de persistencia relacional
│   ├── docker-compose.yml        # Orquestación de contenedor PostgreSQL 16
│   └── init.sql                  # Script DDL con 12 tablas, relaciones y datos semilla
├── docs/                         # Documentación de ingeniería y levantamiento de información
│   ├── ESTRUCTURA_EQUIPO_Y_ROLES.md # Asignación formal de clases, ramas y tablas
│   ├── Entrevista Respuesta.md   # Entrevista de descubrimiento con el cliente
│   ├── PLAN_FRONTEND_FASE_INDIVIDUAL.md # Guía de integración frontend
│   └── plan prisma.md            # Requerimientos funcionales y no funcionales (RF/RNF)
├── ecommerce/                    # Tienda virtual pública (Fase siguiente)
└── frontend/                     # Aplicación SPA React 19 + Vite + Tailwind CSS v4
    ├── src/
    │   ├── core/                 # Contextos de autenticación (AuthContext) y Toasts
    │   ├── feature/              # Módulos organizados por funcionalidad del negocio
    │   ├── shared/               # Componentes UI reutilizables (Botones, Modales, Tablas)
    │   └── App.jsx               # Enrutamiento principal protegido
    └── vite.config.js            # Configuración de empaquetado y alias
```

---

## 📦 4. Módulos Principales del Sistema

1. 📊 **Dashboard Ejecutivo:** Resumen de ingresos diarios, ticket promedio, prendas con stock crítico y gráficos interactivos de ventas semanales.
2. 🛒 **Punto de Venta (POS):** Cobro rápido con soporte de teclado para escáner de código de barras USB (*keyboard wedge*), cálculo de vuelto, selección de medios de pago (Efectivo, Yape, Plin, Tarjetas) e impresión de ticket.
3. 📦 **Inventario & Kardex:** Gestión de catálogo (SKU, código de barras, precios y fotos), filtros por categoría y registro de movimientos de stock.
4. 💵 **Caja y Turnos:** Apertura de turno con fondo inicial, control de ingresos/egresos y cuadre de caja con cálculo de sobrantes/faltantes.
5. 🚚 **Gestión de Pedidos:** Control de ventas por WhatsApp e Instagram, tracking de estados (*Pendiente*, *En preparación*, *Enviado*, *Entregado*) y couriers locales (**Shalom**, **Comité 6**).
6. 🏭 **Proveedores & Abastecimiento:** Directorio con vista dual (Tarjetas de presentación con enlace directo a WhatsApp y Tabla), más registro de reposición de mercadería.
7. 📈 **Reporte Financiero:** Balance integral de ingresos y egresos, margen bruto por categoría y exportación de transacciones a formato CSV para Excel.
8. ⚙️ **Configuración:** Control de usuarios (`ADMIN` / `VENDEDOR`), líneas de negocio y parámetros de tienda (Moneda Soles PEN, umbral de stock bajo).

---

## 🗄️ 5. Modelo Relacional de Base de Datos

El diseño contempla 12 entidades relacionales conectadas para evitar redundancia y garantizar la integridad contable:

```
               [users (ADMIN / VENDEDOR)]
                           │
[categories] ──1:N──< [products] >──N:1── [suppliers]
                     │         │
                     │         └──N:1──< [purchase_details] >──N:1── [purchases] (Egresos)
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

---

## 🚀 6. Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js:** Versión 20.x o superior
- **Java JDK:** Versión 21 o 25 (con variable de entorno `JAVA_HOME`)
- **Docker y Docker Compose:** Para la base de datos PostgreSQL local (o PostgreSQL 16 instalado)
- **Git:** Para clonar y gestionar ramas

---

### Paso 1: Levantar la Base de Datos (Docker)
```powershell
cd database
docker compose up -d
```
> La base de datos iniciará en el puerto `5432` con usuario `prisma_user` y contraseña `prisma_password`, ejecutando automáticamente `init.sql`.

---

### Paso 2: Levantar el Backend (Spring Boot)
```powershell
cd backend

# Compilar dependencias
.\mvnw.cmd compile

# Iniciar servidor de desarrollo (puerto 8080)
.\mvnw.cmd spring-boot:run
```

---

### Paso 3: Levantar el Frontend (React + Vite)
```powershell
cd frontend

# Instalar librerías
npm install

# Iniciar servidor Vite (puerto 5173)
npm run dev
```

Abre tu navegador en `http://localhost:5173/proyecto-prisma/` o `http://localhost:5173/`.

---

## 🌐 7. Despliegue en Producción (CI/CD)

El frontend cuenta con un pipeline de integración y despliegue continuo mediante **GitHub Actions** (`.github/workflows/deploy.yml`).

- Cada vez que se integra código a la rama `main`, GitHub Actions:
  1. Instala dependencias con `npm ci`.
  2. Compila el bundle optimizado con `npm run build`.
  3. Despliega automáticamente en **GitHub Pages**.

🔗 **URL Pública:** [https://0koikoi.github.io/proyecto-prisma/](https://0koikoi.github.io/proyecto-prisma/)

---

## 🌿 8. Estrategia de Ramas Git (GitFlow)

El equipo aplica el flujo de trabajo coordinado por la líder de proyecto:

```
  main ───────────●──────────────────●─────── (Producción / GitHub Pages)
                   ▲                  ▲
  develop ─────────●─────●──────●─────●────── (Integración continua)
                   │     │      │     │
  feature/* ───────┘     │      │     └────── fix/correcciones-merge
  (ramas por integrante) └──────┘
```

- **`main`:** Código 100% estable para despliegues oficiales y evaluación.
- **`develop`:** Rama común de integración.
- **`feature/<nombre-modulo>`:** Ramas individuales de desarrollo por integrante.
- **`fix/<nombre-arreglo>`:** Ramas para homologación de interfaz y resolución de conflictos.

---

## 📄 Licencia y Derechos
Desarrollado por el equipo de proyecto para **Tienda Prisma** — Todos los derechos reservados © 2026.
