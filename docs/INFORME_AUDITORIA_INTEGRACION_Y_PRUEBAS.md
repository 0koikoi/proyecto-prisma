# Informe de Auditoría de Integración y Pruebas Unitarias

**Proyecto:** Prisma — Sistema Web de Gestión de Inventario, Punto de Venta, Pedidos, Finanzas y Compras  
**Fecha de Auditoría:** 18 de Octubre de 2026  
**Líder de Proyecto / Administradora del Repositorio:** Zully  
**Rama Base:** `develop`  
**Estado General:** **APROBADO (100% de ramas integradas, 0 errores de compilación, 80/80 pruebas en verde, frontend compilado)**

---

## 1. Resumen Ejecutivo

El presente documento certifica que **todos los desarrollos de las ramas de características del equipo han sido conciliados e integrados exitosamente en la rama `develop`**. Se resolvieron colisiones estructurales de beans en Spring Boot, interfaces duplicadas entre capas de dominio e infraestructura, y proyecciones de stock reservado.

Tanto el backend (Spring Boot 4.1.1 / Java 25) como el frontend (React 19 / Vite 8 / TailwindCSS 4) se encuentran completamente operativos, con sus suites de pruebas y bundles de producción validados.

---

## 2. Matriz de Integración de Ramas

Todas las ramas remotas del repositorio se encuentran en **0 commits pendientes** respecto a `develop`:

| Rama Remota | Responsable | Módulo / Funcionalidad | Commits Pendientes | Estado |
| :--- | :--- | :--- | :---: | :---: |
| `origin/feature/auth` | Tatiana Tello | Configuración inicial de seguridad y roles | **0** | ✅ Integrada |
| `origin/feature/users` | Keyla Mateo | Autenticación JWT OAuth2, login, cambio de contraseña obligatoria y bloqueo por fuerza bruta | **0** | ✅ Integrada |
| `origin/feature/backend/inventario` | Mauricio | Catálogo normalizado, categorías, productos, variantes y transacciones de stock con bloqueos pesimistas | **0** | ✅ Integrada |
| `origin/feature/inventario-mercaderia` | Mauricio | Frontend de catálogo, gestión de productos y ajuste de inventario | **0** | ✅ Integrada |
| `origin/feature/backend-pos-caja` | Leo Sle | Ventas de mostrador transaccionales, control de turnos de caja y arqueo ciego en servidor | **0** | ✅ Integrada |
| `origin/feature/punto-venta-caja` | Leo Sle | Terminal POS rápida con lector de barras y módulo de arqueo y corte de caja | **0** | ✅ Integrada |
| `origin/feature/backend-pedidos-proveedores` | Zully | Gestión de pedidos multicanal, reservas automáticas y gestión de proveedores con validación de RUC/DNI | **0** | ✅ Integrada |
| `origin/feature/pedidos-proveedores` | Zully | Interfaz de pedidos, tarjetas de proveedores y flujo de abastecimiento | **0** | ✅ Integrada |
| `origin/feature/reporte-financiero` | Melissa Callo | Módulo de reportes financieros, balance por período, transacciones de ingresos/egresos y compras | **0** | ✅ Integrada |
| `origin/feature/dashboard` | O3rosamateo | Tablero principal y métricas generales | **0** | ✅ Integrada |
| `origin/feature/dashboard-auth` | Tatiana Tello | Enrutado y protección de vistas por rol | **0** | ✅ Integrada |
| `origin/fix/correcciones-merge` | Tatiana Tello | Correcciones de enrutamiento y alineación de alertas | **0** | ✅ Integrada |
| `origin/revert-6-feature/dashboard` | O3rosamateo | Sincronización de reversión previa | **0** | ✅ Integrada |

---

## 3. Resoluciones Técnicas y Corrección de Conflictos

Durante el proceso de unificación en `develop`, se identificaron y solventaron las siguientes discrepancias:

1. **Eliminación de Repositorios Duplicados y Colisión de Beans Spring:**
   * Múltiples integrantes crearon clases espejo en `com.prisma.api.infrastructure.persistence` para entidades que ya contaban con repositorio en `com.prisma.api.domain.repository` (`UserRepository`, `ProductVariantRepository`, `InventoryMovementRepository`).
   * **Resolución:** Se consolidaron las consultas requeridas por cada módulo en el paquete canónico de dominio (`com.prisma.api.domain.repository`), eliminando las réplicas en persistencia y evitando el error `BeanDefinitionOverrideException`.
2. **Proyección SQL de Stock Reservado:**
   * En `ProductVariantRepository.Availability`, la inclusión de una implementación `default` en la interfaz provocaba que Spring Data JPA omitiera la proyección nativa de la vista `v_inventory_availability`. Se restauró la firma abstracta y se adaptó el mock de pruebas en `SaleServiceTest`.
3. **Manejo Global de Excepciones y Autenticación:**
   * Se incorporó el manejador para `ResponseStatusException` en `GlobalExceptionHandler`, garantizando que fallos de credenciales respondan con código `INVALID_CREDENTIALS` (401) en formato JSON estandarizado en lugar de errores 500.
   * Se actualizó `CatalogActor` para discriminar entre tokens revocados/usuarios inactivos (`401 UNAUTHORIZED`) y permisos insuficientes (`403 FORBIDDEN`).
4. **Unificación de Repositorios de Finanzas y Compras:**
   * En `CashRegisterRepository` se preservaron los bloqueos pesimistas compartidos (`PESSIMISTIC_READ`) y exclusivos (`PESSIMISTIC_WRITE`) junto con la búsqueda de turnos por estado.
   * En `FinancialTransactionRepository` se fusionaron las consultas de agregación de totales por método de pago de caja con los filtros por período y transacciones de compras.
   * En `SupplierRepository` se mantuvieron las validaciones de unicidad de RUC/DNI junto a las consultas de proveedores activos.
   * En `suppliersService.js` se conectó `registerRestock` directamente al nuevo endpoint `/api/purchases`.

---

## 4. Auditoría de Pruebas Unitarias e Integración (Backend)

**Resultado de la ejecución (`mvnw test`):**
* **Total de Pruebas Ejecutadas:** 80
* **Pruebas Aprobadas:** 80 (100%)
* **Fallos / Errores:** 0
* **Tiempo Total:** 54.75 s
* **Veredicto:** **BUILD SUCCESS**

### Detalle por Suite de Pruebas

#### 1. Autenticación y Usuarios (`AuthServiceTest` - 7 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `loginReturnsTokenAndPublicUserForActiveAccount` | Generación exitosa de JWT para usuario activo con claims correctos | **PASS** |
| `loginRejectsInactiveAccount` | Rechazo de login con 401 si la cuenta está desactivada lógicamente | **PASS** |
| `loginRejectsUnknownAccount` | Rechazo de login con 401 si el usuario no existe | **PASS** |
| `thirdConsecutiveFailedAttemptBlocksAccountForTenMinutes` | Bloqueo temporal por 10 min tras 3 intentos fallidos consecutivos | **PASS** |
| `successfulLoginResetsPriorFailuresAndExpiredLock` | Restablecimiento de contador de fallos y desbloqueo tras login exitoso | **PASS** |
| `passwordChangeRemovesRequiredChangeFlagAndHashUpdatesPassword` | Actualización de hash BCrypt y remoción del flag de cambio obligatorio | **PASS** |
| `seededAdministratorPasswordMatchesTheDocumentedTemporaryCredential` | Validación de credenciales maestras de inicio del sistema | **PASS** |

#### 2. Control y Cierre de Caja (`CashRegisterServiceTest` - 10 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `open_createsRegisterForCurrentUser` | Apertura de turno vinculada al usuario autenticado | **PASS** |
| `open_rejects_whenAnotherRegisterIsOpen` | Bloqueo de apertura si ya existe una caja activa (RF10) | **PASS** |
| `open_translatesUniqueIndexViolation` | Manejo de concurrencia e índice único en base de datos | **PASS** |
| `status_aggregatesTotalsByPaymentMethod` | Agrupación exacta de montos por método de pago | **PASS** |
| `status_whenNoOpenRegister_isClosed` | Respuesta adecuada cuando no hay turno activo | **PASS** |
| `close_computesExpectedAndDifference` | Cálculo automático del saldo esperado vs declarado en servidor | **PASS** |
| `close_rejects_whenNoOpenRegister` | Rechazo de intento de cierre si no hay turno abierto | **PASS** |
| `close_reportsSurplusAsPositiveDifference` | Registro y cómputo de sobrantes de caja | **PASS** |
| `close_allows_shortageAtThresholdAndSurplusWithoutNotes` | Tolerancia de descuadres dentro del umbral permitido sin nota | **PASS** |
| `close_rejects_whenShortageAboveThresholdHasNoNotes` | Rechazo de cierre si el faltante excede el umbral y no tiene justificación | **PASS** |

#### 3. Punto de Venta y Facturación (`SaleServiceTest` y `SaleQueryServiceTest` - 15 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `cashSale_decrementsStock_andRecordsMovementAndPayment` | Venta en efectivo: descuento de stock, movimiento contable y cobro | **PASS** |
| `percentDiscount_isComputedByServer_andDigitalPaymentHasNoCashGiven` | Cálculo de descuento en servidor y cobro digital exacto | **PASS** |
| `replayWithSameRequestKey_returnsOriginalSale` | Idempotencia: reenvío con mismo `requestKey` no duplica venta | **PASS** |
| `mergesDuplicateLines` | Consolidación automática de ítems duplicados en el carrito | **PASS** |
| `rejects_whenNoOpenRegister` | Rechazo de venta si la caja no ha sido abierta previamente | **PASS** |
| `rejects_whenAvailableStockIsNotEnough` | Rechazo de venta si el stock disponible es insuficiente | **PASS** |
| `rejects_whenVariantIsInactive` | Rechazo de venta de variantes desactivadas | **PASS** |
| `rejects_whenVariantDoesNotExist` | Rechazo de venta de variantes no existentes | **PASS** |
| `rejects_whenCashGivenIsLessThanTotal` | Rechazo si el efectivo entregado no cubre el total | **PASS** |
| `rejects_whenDiscountExceedsSubtotal` | Rechazo si el descuento supera el subtotal | **PASS** |
| `rejects_whenTotalIsZero` | Rechazo de ventas por monto cero o negativo | **PASS** |
| `getById_returnsSaleDetail` | Consulta detallada de venta con líneas y métodos de pago | **PASS** |
| `getById_throwsNotFound_whenSaleDoesNotExist` | Retorno de 404 ante ID de venta inexistente | **PASS** |
| `listCurrentShift_returnsEachSaleWithItsOwnDetailsAndPayment` | Listado histórico de ventas del turno actual | **PASS** |
| `listCurrentShift_isEmpty_whenNoOpenRegister` | Listado vacío si no hay caja abierta | **PASS** |

#### 4. Pedidos y Reservas de Stock (`OrderServiceTest` - 7 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `createOrderSuccess` | Creación de pedido con generación de código y reserva de stock | **PASS** |
| `createOrderIdempotency` | Idempotencia ante reintentos de creación de pedido | **PASS** |
| `createOrderFailsWhenVariantNotFound` | Falla controlada si una variante solicitada no existe | **PASS** |
| `transitionToPreparingSuccess` | Transición de estado a PREPARING con registro en historial | **PASS** |
| `transitionToShippedSuccess` | Transición a SHIPPED para entregas locales | **PASS** |
| `transitionToShippedNationalRequiresPayment` | Exigencia de pago completo previo a despacho nacional | **PASS** |
| `transitionToCancelledReleasesReservations` | Cancelación de pedido libera automáticamente el stock reservado | **PASS** |

#### 5. Proveedores (`SupplierServiceTest` - 10 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `getAllActive` | Consulta de proveedores activos ordenados alfabéticamente | **PASS** |
| `getByIdSuccess` | Obtención de proveedor por ID | **PASS** |
| `getByIdNotFound` | Retorno de 404 para proveedor inexistente | **PASS** |
| `createSuccess` | Creación exitosa de proveedor con validaciones de contacto | **PASS** |
| `createFailsWithDuplicateTaxId` | Rechazo si ya existe el par tipo y número de documento | **PASS** |
| `createFailsWithInvalidTaxIdPair` | Validación de coherencia entre tipo de documento y longitud/formato | **PASS** |
| `deactivateSuccess` | Baja lógica preservando compras asociadas (RN15) | **PASS** |
| `getProductsBySupplierSuccess` | Listado de productos vinculados al proveedor | **PASS** |
| `linkProductSuccess` | Asociación de producto al catálogo del proveedor | **PASS** |
| `unlinkProductSuccess` | Desvinculación de producto del proveedor | **PASS** |

#### 6. Compras y Reportes Financieros (`PurchaseServiceTest` y `FinancialServiceTest` - 4 pruebas)
| Caso de Prueba | Propósito / Regla Validada | Resultado |
| :--- | :--- | :---: |
| `registerPurchaseAndRestock_success` | Registro de compra, reposición de inventario y movimiento financiero | **PASS** |
| `registerPurchaseAndRestock_supplierNotFound` | Control de error si el proveedor de la compra no existe | **PASS** |
| `registerPurchaseAndRestock_cashRequiresOpenRegister` | Compras en efectivo exigen turno de caja abierto | **PASS** |
| `getFinancialSummary_calculatesCorrectTotals` | Balance de ingresos vs egresos por período seleccionado | **PASS** |

#### 7. Integración de Catálogo y Concurrencia (`CatalogApiIntegrationTests` e `InventoryApiIntegrationTests` - 26 pruebas)
Pruebas end-to-end con PostgreSQL embebido y tokens JWT reales:
* **Catálogo (14 pruebas):** Unicidad de SKU y código de barras nullable, protección de roles (ADMIN vs VENDEDOR), ocultamiento de costos a vendedores, normalización de espacios y mayúsculas, y rechazo de tokens emitidos a usuarios desactivados.
* **Inventario y Kardex (12 pruebas):** Concurrencia pesimista en retiros de la última unidad (`PESSIMISTIC_WRITE`), transaccionalidad total (fallos contables revierten actualización de stock), reversión única de ajustes con trazabilidad de autor, y respeto riguroso de unidades reservadas en órdenes activas.

#### 8. Carga de Contexto Global (`ApiApplicationTests` - 1 prueba)
| Caso de Prueba | Propósito | Resultado |
| :--- | :--- | :---: |
| `contextLoads` | Inicialización de todos los controladores, servicios, repositorios y seguridad | **PASS** |

---

## 5. Auditoría de Frontend

* **Módulos Auditados en `frontend/src/feature`:**
  * `auth`: Login, cambio de contraseña obligatoria, sesión con JWT.
  * `cash-register`: Apertura de turno, arqueo ciego, cierre con balance esperado/diferencia, estados de caja.
  * `dashboard`: Métricas generales, accesos directos, resúmenes de inventario y actividad.
  * `financial-reports`: Reportes de ingresos/egresos, balance por período, transacciones financieras.
  * `inventory`: Gestión de productos, variantes (talla, color, SKU, código de barras), ajustes de inventario auditados, historial de movimientos.
  * `orders`: Gestión de pedidos multicanal, transiciones de estado, reserva automática de stock.
  * `pos`: Terminal de punto de venta, venta rápida con lector de barras o selección, cálculo de vuelto, soporte de múltiples métodos de pago, descuento manual.
  * `suppliers`: Directorio de proveedores con validación de RUC/DNI, vinculación de productos suministrados, registro de reposición de stock conectado a compras.
* **Compilación de Producción (`npm run build`):**
  * **Resultado:** `3072 modules transformed. built in 1.48s (0 errores)`
* **Linter de Calidad (`oxlint`):**
  * **Resultado:** `0 errores` en 75 archivos analizados.

---

## 6. Conclusión y Recomendación

La rama `develop` se encuentra en un estado **estable, completamente funcional y certificado**.
Todos los módulos de los integrantes se comunican armónicamente sin colisiones de dependencias, duplicidades de base de datos ni fallos en pruebas unitarias.

**Acción recomendada:**
Ejecutar el despliegue o sincronización hacia el repositorio remoto:
```bash
git push origin develop
```
Posteriormente, `develop` está lista para ser promovida a `main` mediante Pull Request final de integración.
