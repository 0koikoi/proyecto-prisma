# Tienda Prisma — Backend API (Spring Boot)

API REST centralizada para la plataforma de gestión de Tienda Prisma, construida con **Spring Boot 4.1**, **Java 25**, **Spring Data JPA** y conectada a **PostgreSQL 17**.

---

## 1. Stack Tecnológico

- **Lenguaje:** Java 25 (LTS)
- **Framework:** Spring Boot 4.1.1
- **Persistencia:** Spring Data JPA + Hibernate
- **Base de Datos:** PostgreSQL 17 (Neon)
- **Seguridad:** Spring Security, contraseñas BCrypt y JWT
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

Antes de iniciar, copia `.env.example` a `.env` y configura `DB_URL`, `DB_USER`,
`DB_PASSWORD` y un `JWT_SECRET` aleatorio de al menos 32 bytes. `DB_FLYWAY_URL`
es opcional y se usa cuando las migraciones necesitan una conexión directa distinta.
El frontend debe apuntar a `http://localhost:8080/api` mediante `VITE_API_URL`.
En PowerShell puedes generar un secreto con:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

La migración inicial crea la cuenta `admin` con contraseña temporal `admin123`;
cámbiala en el primer acceso. Tras 3 intentos fallidos consecutivos, la cuenta
queda bloqueada por 10 minutos. Un inicio correcto reinicia el contador.

## 3. Autenticación

- `POST /api/auth/login`: acepta `{ "username": "...", "password": "..." }` y devuelve
  un token JWT y el perfil público del usuario activo.
- `GET /api/auth/me`: devuelve el perfil asociado a un JWT válido enviado como
  JWT en el encabezado HTTP `Authorization`.
- `POST /api/auth/change-password`: actualiza la contraseña autenticada y devuelve
  un JWT renovado. Las claves deben tener al menos 8 caracteres, una mayúscula,
  un número y un símbolo.
- No existe registro público. Las cuentas se gestionan mediante la base de datos.

---

## 4. Endpoints Principales

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

## 5. Configuración de Base de Datos

La conexión no tiene credenciales por defecto. El perfil `dev` toma la URL,
usuario y contraseña de `DB_URL`, `DB_USER` y `DB_PASSWORD`; Flyway puede usar
`DB_FLYWAY_URL` y `DB_FLYWAY_USER` si se requiere una conexión directa a Neon.
El perfil `prod` también exige `JWT_SECRET` y una URL PostgreSQL con SSL.
