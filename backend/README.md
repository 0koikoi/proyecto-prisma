# Tienda Prisma — Backend

API con Spring Boot 4.1.1, Java 25, Spring Data JPA, PostgreSQL, Flyway y autenticación JWT.

## Funcionamiento

La solicitud pasa por controlador → servicio transaccional → repositorio JPA → PostgreSQL. Los controladores validan el JSON, los servicios aplican permisos y reglas, y Flyway versiona el esquema. Hibernate lo verifica mediante `ddl-auto=validate`.

El login `POST /api/auth/login` valida contraseña BCrypt y devuelve un JWT. Enviar `Authorization: Bearer <token>` en las operaciones protegidas. Catálogo e Inventario usan esa misma autenticación.

## Módulos operativos

| Área | Ruta base | Comportamiento |
|---|---|---|
| Autenticación | `/api/auth` | Login y consulta del usuario autenticado. |
| Categorías | `/api/categories` | Alta, consulta, edición, desactivación y reactivación. |
| Productos | `/api/products` | Datos generales, clasificación e imágenes mediante URL. |
| Variantes | `/api/variants` | SKU, código de barras, talla/color, precios y disponibilidad. |
| Inventario | `/api/inventory/movements` | Historial paginado, filtros, referencias y reversión de ajustes manuales. |

Consultar [el contrato de Catálogo e Inventario](./CATALOGO_INVENTARIO.md) para rutas completas, ejemplos y reglas de integración. La existencia de entidades de ventas, pedidos y compras no implica que sus operaciones HTTP estén implementadas.

## Desarrollo

Configurar un **JDK 25** y las variables de [.env.example](./.env.example). Usar credenciales de una base de desarrollo propia. No guardar `.env` en Git.

Desde `backend/`:

```powershell
.\mvnw.cmd compile
.\mvnw.cmd spring-boot:run
```

El servidor utiliza el puerto 8080. El perfil `dev` obtiene su conexión de `DB_URL`, `DB_USER` y `DB_PASSWORD`; Flyway puede usar `DB_FLYWAY_URL`, `DB_FLYWAY_USER` y `DB_FLYWAY_PASSWORD` si requiere otra conexión. La firma JWT utiliza `JWT_SECRET`.

**Arrancar el servidor aplica las migraciones pendientes sobre la base configurada.** V3 y V4 comprueban unicidad normalizada; los duplicados históricos deben conciliarse antes. Las migraciones no fusionan ni borran esos registros automáticamente.

## Pruebas aisladas

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd -DskipTests package
```

La suite inicia PostgreSQL **17.11** desechable en un puerto local libre, aplica las migraciones y prueba la API con JWT obtenido mediante el login real. No necesita Docker ni credenciales de Neon. Maven descarga los binarios de prueba cuando faltan en caché.

`LocalPostgresTest` fija las conexiones JPA/Flyway a esa instancia, usa configuración exclusiva y comprueba la conexión antes de limpiar datos ficticios. Surefire excluye el cargador de `.env` del classpath de pruebas. Ejecutar mediante el wrapper de Maven para conservar ese aislamiento.

La suite cubre permisos, validaciones, variantes, búsquedas, reservas, concurrencia, idempotencia, reversas y rollback de stock cuando falla el movimiento. Los tests son secuenciales salvo los escenarios concurrentes explícitos.
