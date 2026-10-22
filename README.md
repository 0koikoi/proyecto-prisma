# Tienda Prisma — Sistema de Gestion Comercial y Backoffice

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)

> **Plataforma web integral de gestion comercial, control de inventario, punto de venta (POS), caja y finanzas para Tienda Prisma (Huanuco, Peru).**

**Demo en linea:** [https://0koikoi.github.io/proyecto-prisma/](https://0koikoi.github.io/proyecto-prisma/)

---

## 1. Acerca del Proyecto

**Tienda Prisma** es un emprendimiento de moda ubicado en Huanuco que opera a traves de dos canales principales: **tienda fisica** y ventas por **redes sociales** (Instagram, WhatsApp). Cuenta con tres lineas de negocio especializadas:
- **Moda Femenina:** Ropa juvenil de tendencia.
- **Moda Urbana:** Prendas unisex y streetwear.
- **Mascotas:** Ropa y accesorios para perros y gatos.

### Problematica que Resuelve
Historicamente, el control de ventas, inventario y caja se realizaba en hojas de calculo de Excel manuales, ocasionando:
1. **Descuadres de stock:** Ventas de prendas ya agotadas a traves de redes sociales.
2. **Falta de trazabilidad:** Ausencia de registro entre compras a talleres de confeccion y precio de costo unitario.
3. **Perdida de tiempo:** Registro manual repetitivo en los cierres de caja diarios y balance de fin de mes.

Este sistema centraliza la operacion fisica y digital en una sola plataforma en tiempo real, garantizando sincronizacion de inventario, cobro agil en caja y calculo automatico de rentabilidad.

---

## 2. Equipo de Desarrollo y Distribucion de Roles

| Integrante | Rol en el Equipo | Modulo Asignado | Rama Git Oficial | Clases / Componentes Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Zully (Tatiana Tello)** | **Lider de Proyecto & Control de Versiones** | **Pedidos, Proveedores & Coordinacion Git** | `feature/pedidos-proveedores` | `OrdersPage`, `SuppliersPage`, `OrderStatusModal`, `validators.js`, `Order.java`, `Supplier.java` |
| **Keila** | **Arquitectura Frontend, Auth & Dashboard** | **Dashboard, Autenticacion (JWT) & Configuracion** | `feature/dashboard-auth` | `DashboardPage`, `LoginPage`, `SettingsPage`, `User.java`, `AuthController.java` |
| **Mauricio** | **Gestion de Mercaderia** | **Inventario, Productos & Categorias** | `feature/inventario-mercaderia` | `InventoryPage`, `Product.java`, `Category.java`, `inventoryService.js` |
| **Leo** | **Operaciones en Tienda** | **Punto de Venta (POS) & Arqueo de Caja** | `feature/punto-venta-caja` | `PosPage`, `CashRegisterPage`, `Sale.java`, `CashRegister.java`, `usePos.js` |
| **Meli** | **Analisis Contable** | **Reporte Financiero & Rentabilidad** | `feature/reporte-financiero` | `FinancialReportsPage`, `FinancialTransaction.java`, exportador CSV |

---

## 3. Arquitectura del Repositorio (Monorepo)

```
proyecto-prisma/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD automatizado para despliegue en GitHub Pages
├── backend/                      # API REST construida con Spring Boot 4.1 y Java 25
│   ├── src/main/java/com/prisma/api/
│   │   ├── application/          # Servicios de aplicacion (OrderService, SupplierService, etc.)
│   │   ├── domain/               # Entidades JPA (Product, Sale, Order, etc.) y Repositorios
│   │   └── infrastructure/       # Controladores REST, Persistencia y Seguridad Spring Security 6
│   ├── pom.xml                   # Gestion de dependencias Maven
│   └── README.md                 # Documentacion tecnica del backend
├── database/                     # Capa de persistencia relacional
│   ├── docker-compose.yml        # Orquestacion de contenedor PostgreSQL local
│   └── init.sql                  # Script DDL con tablas, relaciones y datos semilla
├── docs/                         # Documentacion de ingenieria y bitacoras tecnicas
├── frontend/                     # Aplicacion SPA React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── core/                 # Contextos de autenticacion (AuthContext), Toasts y Cliente API
│   │   ├── feature/              # Modulos de negocio (Orders, Suppliers, POS, Inventory, Cash, etc.)
│   │   ├── shared/               # Componentes UI reutilizables (Botones, Modales, Tablas)
│   │   │   └── utils/            # Validadores (validators.js) y formateadores (formatters.js)
│   │   └── App.jsx               # Enrutamiento principal protegido
│   └── vite.config.js            # Configuracion de empaquetado, alias y proxy inverso local
```

---

## 4. Modulos Principales del Sistema

1. **Dashboard Ejecutivo:** Resumen de ingresos diarios, ticket promedio, prendas con stock critico y graficos interactivos de ventas semanales.
2. **Punto de Venta (POS):** Cobro rapido con soporte de teclado para escaner de codigo de barras USB (keyboard wedge), calculo de vuelto, seleccion de medios de pago (Efectivo, Yape, Plin, Tarjetas) e impresion de ticket.
3. **Inventario & Kardex:** Gestion de catalogo (SKU, codigo de barras, precios y fotos), filtros por categoria y registro de movimientos de stock con transacciones de kardex.
4. **Caja y Turnos:** Apertura de turno con fondo inicial, control de ingresos/egresos y cuadre de caja con calculo de sobrantes/faltantes.
5. **Gestion de Pedidos y Logistica:** Control multicanal (WhatsApp, Messenger, Instagram, Web), seguimiento de ciclo de vida (Pendiente, En Preparacion, Enviado, Entregado, Cancelado), registro de guias y couriers (Shalom, Olva Courier, repartidores locales) y buscador universal.
6. **Proveedores & Abastecimiento:** Directorio dual (Tarjetas y Tabla), validacion de documentos tributarios (RUC 11 digitos, DNI 8 digitos) y registro de compras de reposicion con calculo de inversion.
7. **Reporte Financiero:** Balance integral de ingresos y egresos, margen bruto por categoria y exportacion de transacciones a formato CSV para Excel.
8. **Configuracion:** Control de usuarios (ADMIN / VENDEDOR), lineas de negocio y parametros de tienda.

---

## 5. Validaciones y Estandares de Interfaz

- **Telefonia Movil (Peru):** Validacion estricta con patron `^9\d{8}$` (debe iniciar obligatoriamente con 9 y contener exactamente 9 digitos). Sanitizacion automatica en tiempo real para descartar caracteres no numericos.
- **Documentos de Identidad:** Validacion automatica de RUC (11 digitos numericos) y DNI (8 digitos numericos).
- **Nombres y Razon Social:** Validacion de longitud minima (3 caracteres) y caracteres permitidos (letras, tildes y espacios).
- **Directrices Responsive:** Layout mobile-first con areas tactiles comodas (altura minima de 44px segun estandar WCAG), botones de accion adaptables a ancho completo en telefonos moviles y pie de modales apilado ergonomicamente.

---

## 6. Modelo Relacional de Base de Datos

El diseno contempla entidades relacionales sincronizadas con PostgreSQL en Neon Cloud:

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
  ├──N:1──> [cash_registers]            └── Registra courier (Shalom / Olva / Local)
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

## 7. Guia de Instalacion y Ejecucion Local

### Prerrequisitos
- **Node.js:** Version 20.x o superior
- **Java JDK:** Version 21 o 25 (con variable de entorno `JAVA_HOME`)
- **Docker y Docker Compose:** Para base de datos local (o conexion a PostgreSQL Neon Cloud)
- **Git:** Para clonar y gestionar ramas

---

### Paso 1: Levantar la Base de Datos
Si se utiliza Docker localmente:
```powershell
cd database
docker compose up -d
```
En caso de usar la base de datos centralizada de Neon Cloud, configurar las credenciales en `backend/.env`.

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

# Instalar librerias
npm install

# Iniciar servidor Vite (puerto 5173)
npm run dev
```

El aplicativo estara disponible en `http://localhost:5173/proyecto-prisma/` o `http://localhost:5173/`.

---

## 8. Estrategia de Ramas Git (GitFlow)

El equipo aplica el flujo de trabajo coordinado por la lider de proyecto:

```
  main ───────────●──────────────────●─────── (Produccion / GitHub Pages)
                   ▲                  ▲
  develop ─────────●─────●──────●─────●────── (Integracion continua)
                   │     │      │     │
  feature/* ───────┘     │      │     └────── fix/correcciones-merge
  (ramas por integrante) └──────┘
```

- **`main`:** Codigo estable para despliegues oficiales y evaluacion.
- **`develop`:** Rama comun de integracion.
- **`feature/<nombre-modulo>`:** Ramas individuales de desarrollo por integrante.
- **`fix/<nombre-arreglo>`:** Ramas para homologacion de interfaz y resolucion de conflictos.

---

## 9. Historial de Versiones

### Version 1.0.0 (Release Inicial)
- Integracion de los modulos de Punto de Venta (POS), Arqueo de Caja, Inventario, Reportes Financieros, Pedidos y Proveedores.
- Persistencia relacional con PostgreSQL y control de migraciones con Flyway.
- Validaciones estrictas de datos adaptadas a Peru (celular de 9 digitos iniciando con 9, RUC de 11 digitos, DNI de 8 digitos).
- Flujo formal de estados de pedidos (Pendiente, En Preparacion, Enviado, Entregado, Cancelado) con asignacion de couriers (Shalom, Olva Courier) y guias de seguimiento.
- Diseno responsive y ergonomia tactil segun estandares WCAG.

---

## Licencia y Derechos
Desarrollado por el equipo de proyecto para **Tienda Prisma** — Todos los derechos reservados (c) 2026.
