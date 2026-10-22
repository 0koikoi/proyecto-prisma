# Contrato de Catálogo e Inventario

## Estructura y alcance

El módulo completa el flujo HTTP → servicio transaccional → repositorio JPA de `categories`, `products`, `product_variants` e `inventory_movements`. Reutiliza las entidades, las relaciones y el login JWT existentes; no crea otro sistema de autenticación.

- `application/services/CatalogService`: catálogo, disponibilidad y estados.
- `application/services/InventoryService`: ajustes manuales, reversas e historial.
- `application/services/CatalogLocks`: orden de bloqueo de categorías, productos y variantes.
- `application/security/CatalogActor`: usuario autenticado, activo y autorizado.
- `application/dto/catalog/CatalogDtos`: cuerpos y respuestas de la API.
- `domain/repository`: consultas JPA y disponibilidad calculada desde las reservas.
- `infrastructure/controllers/catalog`: rutas HTTP y validación de entrada.
- `infrastructure/error`: errores del módulo sin detalles internos de SQL.

La disponibilidad consulta las reservas existentes. Este módulo no implementa la creación de ventas, pedidos, compras ni devoluciones comerciales; esos flujos deben registrar sus propios movimientos en la misma transacción que modifica el stock.

## Autenticación y permisos

Obtener un token con `POST /api/auth/login`, usando `{"username":"...","password":"..."}`. Enviar `Authorization: Bearer <token>` en cada petición del módulo.

| Rol | Lectura | Escritura | Costo de variantes |
|---|---|---|---|
| `ADMIN` activo | Catálogo e historial; puede consultar inactivos | Altas, cambios, estados, ajustes y reversas | Visible |
| `VENDEDOR` activo | Catálogo activo e historial | No permitida | `costPrice: null` |

El usuario se comprueba en la base de datos en cada operación. Desactivarlo invalida su acceso aunque conserve un JWT vigente. No se admiten credenciales HTTP Basic ni existe una ruta de CSRF para este módulo.

## Endpoints

Todas las rutas siguientes tienen prefijo `/api`.

| Método | Ruta | Operación |
|---|---|---|
| GET / POST | `/categories` | Listar / crear categoría |
| GET / PUT / DELETE | `/categories/{id}` | Consultar / editar / desactivar |
| PATCH | `/categories/{id}/active` | Cambiar estado |
| GET / POST | `/products` | Listar / crear producto |
| GET / PUT / DELETE | `/products/{id}` | Consultar / editar / desactivar |
| PATCH | `/products/{id}/active` | Cambiar estado |
| POST | `/products/{productId}/variants` | Crear variante con stock cero |
| GET | `/variants` | Listar variantes y disponibilidad |
| GET | `/variants/by-barcode?barcode=0012345` | Buscar código exacto, conservando ceros iniciales |
| GET / PUT / DELETE | `/variants/{id}` | Consultar / editar / desactivar |
| PATCH | `/variants/{id}/active` | Cambiar estado |
| POST | `/variants/{id}/adjustments` | Registrar ajuste manual de stock |
| GET | `/inventory/movements` | Historial paginado |
| GET | `/inventory/movements/{id}` | Consultar movimiento |
| POST | `/inventory/movements/{id}/reversal` | Revertir un ajuste manual una sola vez |

`DELETE` hace una baja lógica y responde `204`; no borra referencias históricas. `PATCH .../active` recibe `{"isActive":true}` o `{"isActive":false}`. Las altas y los ajustes/reversas responden `201`, incluidos los reintentos idempotentes de estos últimos.

## Listados y filtros

Todos los listados reciben `page` desde cero y `size` entre 1 y 100; los valores predeterminados son 0 y 20. Responden:

```json
{"items":[],"page":0,"size":20,"totalElements":0,"totalPages":0}
```

| Listado | Filtros adicionales |
|---|---|
| Categorías | `active`, `q` por nombre |
| Productos | `categoryId`, `active`, `q` por nombre, SKU o código de barras |
| Variantes | `productId`, `categoryId`, `active`, `lowStock`, `q` por producto, SKU o código de barras |
| Movimientos | `variantId`, `type`, `from`, `to` |

En catálogo, omitir `active` equivale a `true`; `active=false` permite al administrador listar inactivos. Para vendedores siempre se aplica el estado activo. El estado efectivo de un producto incluye el de su categoría; el de una variante incluye también el de su producto. Desactivar un padre no sobrescribe el estado individual de sus hijos.

La búsqueda `q` admite hasta 100 caracteres después de quitar espacios exteriores; `%` y `_` se buscan literalmente. Catálogo se ordena por ID ascendente. Movimientos se ordenan por fecha e ID descendentes.

`from` y `to` usan ISO 8601 con zona, por ejemplo `2026-10-01T00:00:00Z`. El inicio es inclusivo y el final exclusivo: `[from, to)`. Si se envían ambos, `from` debe ser anterior a `to`. `type` usa el valor del enum, por ejemplo `ADJUSTMENT` o `REVERSAL`.

## Cuerpos de ejemplo

Crear o editar categoría:

```json
{"name":"Ropa urbana","description":"Prendas de uso diario"}
```

Crear o editar producto:

```json
{"categoryId":1,"name":"Polera Prisma","description":"Algodón","imageUrl":"https://example.com/polera.jpg"}
```

`imageUrl` puede ser `null`; si se informa, debe ser una URL HTTP/HTTPS válida sin credenciales. No se suben archivos por este endpoint.

Crear variante en `/api/products/1/variants`:

```json
{
  "sku":"POL-NEG-M",
  "barcode":"0012345678901",
  "sizeLabel":"M",
  "colorLabel":"NEGRO",
  "costPrice":25.1234,
  "salePrice":49.90,
  "minStockAlert":5
}
```

Para editar, enviar los mismos campos y la `version` recibida en la última consulta. Si otra operación cambió la variante, se responde `409`; recargar y revisar antes de reenviar. El SKU se normaliza a mayúsculas y no admite espacios. Talla y color se normalizan a mayúsculas, con un solo espacio entre palabras. El código de barras es opcional y se trata como texto.

El costo admite hasta cuatro decimales y debe ser no negativo; el precio admite hasta dos y debe ser positivo. SKU, código de barras y combinación producto/talla/color tienen restricciones de unicidad, incluso para registros desactivados.

Ajuste manual en `/api/variants/1/adjustments`:

```json
{"requestKey":"4e913112-572b-4a18-93a9-16c559bda40f","quantity":10,"reason":"Conteo inicial verificado"}
```

`quantity` es un entero con signo distinto de cero: positivo ingresa unidades y negativo retira unidades. Usar un UUID nuevo por operación y conservarlo si se reintenta la misma solicitud. Repetirlo con los mismos datos y usuario devuelve el movimiento existente sin volver a modificar stock. Reutilizarlo para otra operación devuelve `409`.

Reversar el ajuste en `/api/inventory/movements/1/reversal`:

```json
{"requestKey":"b6c474fc-b672-45a8-98e2-177f86b716e7","reason":"Corrección del conteo inicial"}
```

Se registra un movimiento `REVERSAL` de cantidad opuesta con `reversalOfId`; el original se conserva. Solo se revierten ajustes manuales, una vez, y siempre respetando disponibilidad y estados activos. Ventas, compras y sus devoluciones requieren sus propios flujos.

No enviar `currentStock`, `createdBy`, `movementType` ni otros campos ajenos a los DTO: los campos desconocidos se rechazan con `400`. El responsable del movimiento se toma del JWT.

## Integridad y concurrencia

- Una variante empieza con stock cero; el saldo inicial se registra mediante un ajuste auditado.
- `availableStock = currentStock - reservedStock`. Se suman únicamente reservas `ACTIVE`; `lowStock` indica disponibilidad estrictamente menor que `minStockAlert`.
- Un ajuste o reversa nunca deja stock negativo, supera el máximo de un entero ni consume unidades reservadas. Stock y movimiento se guardan en una única transacción; si falla cualquiera, se revierte todo.
- No se desactiva una categoría con productos activos. No se desactiva un producto o variante con reservas activas. No se activan hijos dentro de padres inactivos.
- Las escrituras bloquean primero categoría, luego producto y después variante. Los cambios de categoría bloquean ambas categorías por ID ascendente. Las futuras operaciones con varias variantes deben bloquear primero todas las categorías ordenadas, después todos los productos ordenados y por último todas las variantes ordenadas; no llamar repetidamente a `lockVariant` en un orden arbitrario.
- El historial es de solo lectura, salvo la creación de movimientos compensatorios. Las respuestas incluyen referencias `saleDetailId`, `orderDetailId`, `purchaseDetailId`, `saleReturnDetailId` y `reversalOfId` cuando corresponden.

Las migraciones V3 y V4 agregan índices de unicidad normalizada sin reescribir V1/V2. Si hay duplicados históricos, la migración falla para que se concilien; no fusiona ni elimina información automáticamente.

## Errores e integración

El módulo responde errores con `status`, `code`, `message` y `fieldErrors`. Los estados principales son `400` por entrada inválida, `401` por falta de autenticación válida, `403` por permisos, `404` por recurso inexistente o no visible y `409` por duplicados, reservas o conflicto de concurrencia. El login conserva su contrato de errores existente.

El frontend aún debe conectar sus servicios a estas rutas: consumir `items` de la página, gestionar las variantes por separado y enviar el JWT y las claves de petición. El producto no contiene una colección anidada de variantes; se consulta con `GET /api/variants?productId=...`.

## Verificación local

Desde `backend/`, con JDK 25, ejecutar `./mvnw.cmd clean test` y luego `./mvnw.cmd -DskipTests package`. Las pruebas usan PostgreSQL 17.11 temporal, Flyway y el login real, sin usar la conexión de `.env`. Véase [README](./README.md) para configuración y aislamiento.
