# Tienda Prisma — Backend API (Spring Boot)

API REST centralizada para la plataforma de gestión de Tienda Prisma, construida con **Spring Boot 4.1**, **Java 25**, **Spring Data JPA** y conectada a **PostgreSQL 16**.

---

## 1. Stack Tecnológico

- **Lenguaje:** Java 25 (LTS)
- **Framework:** Spring Boot 4.1.1
- **Persistencia:** Spring Data JPA + Hibernate
- **Base de Datos:** PostgreSQL 16 (Local Docker o Neon en la nube)
- **Seguridad:** Spring Security + JWT (Planificado Sprint 6)
- **Gestor de Dependencias:** Maven (vía `mvnw` / `mvnw.cmd`)

---

## 2. Requisitos Previos y Ejecución

Asegurarse de tener configurado `JAVA_HOME` apuntando al JDK 25:

```powershell
# Definir JAVA_HOME temporalmente si no está en variables del sistema
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.3"

# Compilar el proyecto
.\mvnw.cmd compile

# Ejecutar las pruebas unitarias
.\mvnw.cmd test

# Iniciar la aplicación (puerto 8080)
.\mvnw.cmd spring-boot:run
```

---

## 3. Endpoints Principales

| Módulo | Endpoint Base | Responsable | Descripción |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `/api/auth` | Keila | Login (`/login`) y perfil (`/me`) con JWT |
| **Dashboard** | `/api/dashboard` | Keila | Métricas del día (`/summary`) y stock bajo (`/low-stock`) |
| **Inventario** | `/api/products` | Mauricio | CRUD de productos y búsqueda rápida |
| **Categorías** | `/api/categories` | Mauricio | Catálogo de categorías (Femenina, Urbana, Mascotas) |
| **Punto de Venta** | `/api/sales` | Leo | Registro transaccional de ventas y descuento de stock |
| **Caja** | `/api/cash-register` | Leo | Apertura (`/open`), cierre (`/close`) y arqueo |
| **Pedidos** | `/api/orders` | Zully | Gestión de órdenes y cambio de estado (`/status`) |
| **Proveedores** | `/api/suppliers` | Zully | Directorio de proveedores y compras (`/purchases`) |
| **Finanzas** | `/api/finance` | Meli | Resumen financiero (`/summary`) y transacciones |

---

## 4. Configuración de Base de Datos

Las credenciales por defecto en `src/main/resources/application.properties` se sincronizan con `database/docker-compose.yml`:
- **URL:** `jdbc:postgresql://localhost:5432/prisma_db`
- **Usuario:** `prisma_user`
- **Contraseña:** `prisma_password`
