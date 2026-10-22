# Requerimientos y reglas de negocio — Tienda Prisma

**Estado:** borrador para validación con la responsable de la tienda.  
**Alcance:** sistema web de gestión interna: inventario, punto de venta, caja, pedidos, proveedores, usuarios y reportes. La tienda online pública corresponde a una segunda fase.  
**Objetivo:** centralizar el inventario, las ventas y la caja para reducir las ventas de productos agotados y el trabajo manual de reconstruir el control en Excel cada mes.

Este documento especifica el comportamiento esperado. No certifica que las funciones estén implementadas ni que todas hayan sido aprobadas por la clienta.

## 1. Cómo interpretar los requisitos

- **Requerimiento funcional (RF):** qué debe permitir hacer el sistema.
- **Requerimiento no funcional (RNF):** condiciones de calidad, seguridad, rendimiento y operación que debe cumplir.
- **Regla de negocio (RN):** condición, política o cálculo que rige una operación de la tienda y que el sistema debe respetar.

Ejemplo: registrar una venta es una función; responder dentro del tiempo acordado es una condición de calidad; impedir vender más unidades de las disponibles es una regla de negocio.

### Fuentes y grado de confirmación

| Referencia | Fuente | Qué acredita |
|---|---|---|
| E | [Entrevista de descubrimiento](./Entrevista%20Respuesta.md) | Necesidades y prácticas expresadas por la clienta. |
| P | [Plan de implementación](./plan%20prisma.md) | Funciones y decisiones incluidas en el plan del equipo; no equivalen por sí solas a aprobación de la clienta. |
| F | [Plan frontend](./PLAN_FRONTEND_FASE_INDIVIDUAL.md) | Detalles y ampliaciones planteados por el equipo. |
| T | [Estructura del equipo y módulos](./ESTRUCTURA_EQUIPO_Y_ROLES.md) | Definiciones adicionales del alcance y relaciones entre módulos. |

**Definido** significa incluido en la documentación del proyecto. **Propuesto** significa que necesita acuerdo antes de incorporarse como compromiso. Las cifras nuevas de rendimiento y recuperación son metas propuestas, no capacidades medidas.

## 2. Actores

| Actor | Responsabilidad y acceso previsto |
|---|---|
| Administradora | Gestionar productos, categorías, proveedores, usuarios y parámetros; operar ventas, caja y pedidos; consultar reportes financieros. |
| Vendedor | Operar ventas, caja y pedidos; consultar inventario y una versión reducida del panel. Sin acceso a configuración ni reportes financieros. |

Estos perfiles provienen de P. La entrevista identifica una persona a cargo de tienda y otra de marketing; no establece que la persona de marketing deba tener acceso al sistema.

## 3. Requerimientos funcionales

Se conserva la numeración RF01–RF21 del plan original. Los criterios describen cómo verificar cada función al implementarla.

| ID | Requerimiento | Criterio de aceptación | Base / estado |
|---|---|---|---|
| RF01 | Permitir iniciar sesión mediante usuario y contraseña y finalizar la sesión. | Las credenciales válidas permiten acceder; las inválidas se rechazan. Después de cerrar sesión o expirar su vigencia, se requiere autenticación. | P; cierre explícito propuesto. |
| RF02 | Restringir consultas y operaciones según el perfil. | Un vendedor no puede modificar el catálogo, gestionar proveedores o usuarios, ni consultar reportes financieros, incluso mediante una solicitud directa al servidor. | P / definido. |
| RF03 | Registrar, consultar, editar y dar de baja productos con nombre, descripción, precio, SKU, código de barras, stock, imagen y categoría. | Un producto guardado puede consultarse con sus datos; la baja lo retira de nuevas ventas y conserva las referencias históricas. | P / definido; conservación histórica propuesta. |
| RF04 | Gestionar categorías de productos. | Se pueden crear y editar categorías y asignarlas a productos; se contemplan inicialmente femenina, urbana y mascotas. | E §02; P / definido. |
| RF05 | Mostrar alertas de stock bajo con un umbral configurable. | Cuando el stock queda por debajo del umbral, el producto aparece señalado en inventario y en las alertas. | P / definido. |
| RF06 | Asociar a cada producto un código de barras, ingresado o generado. | El código guardado permite identificar el artículo al buscarlo o escanearlo. La simbología y el equipo se validan antes de cerrar el diseño. | P / definido. |
| RF07 | Buscar productos para la venta por nombre, SKU y categoría mediante un catálogo visual. | El operador puede encontrar un producto y agregarlo al ticket sin disponer de lector. | P / definido. |
| RF08 | Agregar productos al ticket mediante un lector de código de barras USB compatible. | Con el POS activo, una lectura válida agrega el artículo o incrementa su cantidad; un código desconocido muestra un aviso sin agregar otro producto. | E §01; P / definido. |
| RF09 | Permitir editar las cantidades y retirar productos del ticket, calculando subtotales y total. | Modificar una cantidad actualiza el importe; eliminar una línea deja de sumarla al total. | P / definido. |
| RF10 | Registrar el método de pago de la venta: efectivo, Yape o Plin. | La venta conserva el método seleccionado y puede identificarse en el desglose de caja. | E §01; P / definido. |
| RF11 | Confirmar la venta y descontar las unidades correspondientes del inventario. | Una venta válida genera un registro y reduce el stock una sola vez. Si alguna cantidad no está disponible, no se confirma parcialmente la operación. | E §03; P / definido. |
| RF12 | Abrir un turno de caja registrando saldo inicial y responsable. | La apertura queda registrada con fecha, hora, responsable y monto inicial. | E §01; P y F / definido; alcance por turno por validar. |
| RF13 | Registrar automáticamente los cobros de las ventas por método de pago. | Cada venta confirmada aparece una vez en el resumen de caja con su método de pago. | P / definido. |
| RF14 | Cerrar caja comparando el efectivo esperado con el conteo físico. | Se muestran saldo inicial, ventas en efectivo, saldo esperado, monto contado y diferencia. El resultado del cierre queda registrado. | E §01; P / definido. |
| RF15 | Registrar manualmente pedidos recibidos por redes sociales o mensajería. | El pedido conserva nombre, teléfono, dirección, referencia, productos, cantidades, método de pago y modalidad de entrega. | E §01 y §05; P / definido. |
| RF16 | Consultar pedidos y actualizar su estado: pendiente, en preparación, enviado y entregado. | El pedido muestra su estado vigente y solo permite los cambios de estado acordados. | P / definido; reglas de transición por validar. |
| RF17 | Registrar información y evidencia del envío. | Se pueden guardar la foto del paquete y los datos de transporte aplicables: courier, guía o conductor y placa. | E §06; P y F / definido. |
| RF18 | Registrar, consultar y actualizar proveedores y los productos que abastecen. | Se puede localizar un proveedor por sus datos y consultar su relación con los productos. | P / definido. |
| RF19 | Registrar reposiciones de mercadería asociadas a un proveedor. | Cada reposición conserva fecha, producto, cantidad y proveedor e incrementa el stock una sola vez. El costo unitario se incluye si se aprueba el alcance financiero ampliado. | P y F / definido; costo por validar. |
| RF20 | Mostrar un panel con total vendido, número de ventas y productos con stock bajo. | Los indicadores coinciden con los registros del período y se ajustan a los permisos del perfil. | P / definido. |
| RF21 | Consultar reportes de ventas por fechas y categoría y exportar los resultados. | El archivo exportado contiene el mismo conjunto de ventas y totales mostrado por los filtros. Debe acordarse si basta CSV compatible con Excel o se requiere XLSX. | P / definido; formato por validar. |
| RF22 | Permitir a la administradora gestionar usuarios y sus perfiles. | Se pueden crear usuarios y asignarles el perfil autorizado. La desactivación y el restablecimiento de acceso deben quedar definidos. | P §4 y F §2.1 / definido; detalles por validar. |
| RF23 | Consultar el historial de movimientos del inventario. | Las ventas y reposiciones muestran producto, cantidad, fecha, responsable y referencia de la operación que originó el movimiento. | T / definido por el equipo. |
| RF24 | Registrar el estado del pago de un pedido y validar el pago del producto antes de un envío nacional. | Elegir Yape, Plin o efectivo no marca automáticamente el pedido como pagado. Un pedido nacional sin el pago íntegro del producto confirmado no puede pasar a enviado. | E §06 / función propuesta para aplicar una regla confirmada. |

## 4. Requerimientos no funcionales

Se conservan los temas RNF01–RNF04 del plan. Los criterios añadidos permiten sustituir expresiones ambiguas como «rápido» o «seguro» por comprobaciones concretas.

| ID | Requerimiento | Verificación propuesta | Estado |
|---|---|---|---|
| RNF01 | Interfaz en español, adaptable a laptop y tablet y coherente con el diseño blanco y negro del proyecto. | Completar búsqueda, venta y cierre de caja a resoluciones de 1366×768 y 768×1024 sin controles esenciales ocultos o inaccesibles. | Diseño y dispositivos definidos en P; idioma y resoluciones propuestos. |
| RNF02 | La búsqueda y el escaneo del POS deben responder con rapidez suficiente para la atención en mostrador. | Meta propuesta: percentil 95 de búsqueda ≤1 segundo; actualización visible tras completar un escaneo ≤500 ms; confirmación de venta ≤2 segundos. Medir con 2 operadores concurrentes, 5.000 productos de prueba y entorno/red documentados. | Rapidez definida en P; cifras, volumen y condiciones pendientes de acuerdo. |
| RNF03 | La aplicación debe poder desplegarse de forma reproducible en los entornos previstos. | Levantar frontend y backend desde una configuración documentada de contenedores y conectar PostgreSQL local en desarrollo o Neon en producción. No deben depender de rutas personales del equipo. | Docker y PostgreSQL/Neon definidos en P; se trata de una restricción técnica. |
| RNF04 | Proteger credenciales y sesiones. | Ninguna contraseña se almacena en texto plano; se utiliza BCrypt según el plan. Probar expiración de sesión y ausencia de contraseñas o tokens en registros. Usar HTTPS en producción. | Hash definido en P; controles adicionales propuestos. |
| RNF05 | Mantener la consistencia de ventas, stock y caja frente a errores, concurrencia y reintentos. | Con una unidad disponible y dos ventas concurrentes, solo una se confirma. Si falla el registro, no quedan descuentos ni movimientos parciales. Reintentar la misma operación no duplica la venta. | Transaccionalidad definida en P; concurrencia y reintentos detallados como propuesta. |
| RNF06 | Aplicar la autorización también en el servidor. | Solicitudes directas de un vendedor a operaciones administrativas se rechazan sin devolver datos restringidos ni producir cambios. | Roles definidos en P; criterio técnico propuesto. |
| RNF07 | Conservar trazabilidad de las operaciones relevantes. | Ventas, reposiciones, cambios de pedido y cierres pueden vincularse con un identificador, fecha y usuario responsable. | Kardex definido en T; cobertura completa propuesta. |
| RNF08 | Disponer de recuperación verificable de la información. | Meta propuesta: pérdida máxima recuperable de 24 horas y recuperación en un máximo de 4 horas. Realizar una restauración de prueba y documentar su resultado. | Propuesto; pendiente de proveedor, costo y aprobación. |
| RNF09 | Facilitar la operación cotidiana y comunicar los errores de forma comprensible. | La encargada completa apertura, búsqueda, venta, reposición y cierre después de una inducción breve; los errores identifican el campo o problema y conservan los datos válidos ingresados. | Propuesto; duración de inducción y criterio final por acordar. |
| RNF10 | Permitir mantenimiento y evolución sin duplicar el catálogo. | Los módulos utilizan una fuente autorizada de productos y stock; los cambios del esquema se versionan y el futuro comercio electrónico utiliza operaciones del servidor para consultar y modificar información. | Catálogo compartido definido en P; controles de integración propuestos. |

La disponibilidad objetivo, los navegadores soportados y los tiempos de conservación de datos todavía deben acordarse. No se establece operación sin conexión como requisito actual.

## 5. Reglas de negocio

| ID | Regla | Origen y grado de confirmación |
|---|---|---|
| RN01 | Solo la administradora puede modificar el catálogo, gestionar proveedores y usuarios y acceder a reportes financieros; el vendedor opera ventas, caja y pedidos y consulta inventario. | P / definido por el equipo. |
| RN02 | La cantidad vendida debe ser un entero positivo y no superar el stock disponible. El stock no puede quedar negativo. | P prohíbe sobreventa; cantidades enteras positivas propuestas para prendas y artículos vendidos por unidad. |
| RN03 | Una venta confirmada descuenta exactamente las unidades vendidas. Una reposición confirmada incrementa exactamente las unidades recibidas. | P y F / definido por el equipo. |
| RN04 | El cambio de mes no reinicia las existencias ni elimina ventas. Los reportes mensuales se obtienen filtrando el historial. | Propuesta derivada del problema descrito en E §01 y §09. |
| RN05 | Los medios de pago base son efectivo, Yape y Plin. Las tarjetas requieren confirmación adicional. | E §01 confirma los medios base; T introduce tarjetas sin confirmación de la clienta. |
| RN06 | Un envío nacional requiere la cancelación total del producto antes del despacho. Esta regla no define si el flete también se paga anticipadamente. | Confirmada expresamente en E §06. |
| RN07 | Para coordinar una entrega se registran nombre, teléfono, dirección exacta, referencia y método de pago del cliente. | Práctica confirmada en E §01. |
| RN08 | Una venta del POS requiere un turno de caja abierto. | F §2.3 / definido por el equipo; falta acordar cantidad de cajas y turnos. |
| RN09 | En el alcance básico, el efectivo esperado al cierre es saldo inicial + ventas cobradas en efectivo. Los cobros por Yape y Plin se muestran separados y no aumentan el efectivo físico. Si se autorizan otros ingresos, retiros o devoluciones, deben incorporarse al cálculo según su efecto real. | Fórmula básica definida en P; ampliación condicionada a validación. |
| RN10 | La diferencia de caja es efectivo contado − efectivo esperado: un resultado positivo es sobrante y uno negativo es faltante. | P / definición operativa derivada del cuadre. |
| RN11 | Un producto se considera con stock bajo cuando sus existencias son menores que el umbral configurado. | P / definido por el equipo. |
| RN12 | El flujo ordinario del pedido es pendiente → en preparación → enviado → entregado. El estado logístico no acredita por sí solo que el cliente haya pagado. | Flujo definido en P; separación de pago propuesta para aplicar RN06. |
| RN13 | Cada SKU y cada código de barras asignado debe identificar una sola referencia vendible. Si las tallas o colores se controlan por separado, cada variante deberá tener su identificación y stock. | Propuesta; E §02 menciona tallas, pero el modelo de variantes no está definido. |
| RN14 | Una misma operación comercial no puede descontar stock ni contabilizar su cobro dos veces al aparecer como pedido y como venta. | Propuesta necesaria para resolver la relación entre módulos descrita ambiguamente en T. |
| RN15 | La baja de un producto o proveedor no elimina las ventas, reposiciones ni referencias históricas que lo utilizan. | Propuesta de conservación del historial. |

**Ejemplo de cuadre:** saldo inicial S/ 100 + ventas en efectivo S/ 250 = S/ 350 esperados. Si se cuentan S/ 340, existe un faltante de S/ 10. Los S/ 80 cobrados por Yape, si los hubiera, se informan aparte y no modifican ese efectivo esperado.

## 6. Decisiones pendientes antes de aprobar el alcance

| Tema | Decisión necesaria |
|---|---|
| Tallas y colores | Definir si el stock se controla por producto general o por variante y cómo identificar cada talla/color. |
| Stock de pedidos | Acordar si se reserva al confirmar el pedido y cuándo se descuenta definitivamente; definir liberación de reservas. T menciona tanto descuento al despacho como reserva o descuento sin un momento único. |
| Pago y despacho | Definir quién confirma el cobro, qué evidencia necesita y cómo se maneja el pago local contra entrega. La regla confirmada exige pago anticipado del producto en envíos nacionales. |
| Relación pedido–venta | Definir cuándo un pedido genera una venta, un cobro y un movimiento de caja, evitando registros duplicados. |
| Caja | Acordar una o varias cajas, aperturas por día o turno, permisos de cierre y tratamiento de retiros, gastos, cambios y devoluciones. |
| Finanzas | Elegir entre reportes de ventas del plan inicial o el alcance ampliado de compras, costos y rentabilidad de F/T. No llamar «ganancia neta» a un cálculo que aún no define todos sus componentes. |
| Precios y promociones | F propone impedir precio de venta ≤ costo. Validar esta política, ya que no fue expresada por la clienta y afectaría liquidaciones o promociones. |
| Pagos adicionales | Confirmar tarjetas, pagos mixtos y pagos parciales; no están acordados en la entrevista. |
| Correcciones | Definir anulaciones, cambios y devoluciones, sus autorizaciones y sus efectos sobre stock y caja. |
| Datos existentes | Acordar si se importará el inventario de Excel y cómo se verificará el saldo inicial. |
| Infraestructura y calidad | Confirmar lector, hosting, volumen de catálogo y operaciones, red de la tienda, objetivos de recuperación, disponibilidad y navegadores. |
| Ampliaciones del frontend | Validar impresión de tickets, costo de envío, enlace de WhatsApp y exportación XLSX; aparecen como detalles posteriores o formatos no cerrados. |

## 7. Límites del alcance

La primera entrega contempla gestión interna. El comercio electrónico público, sus cuentas de clientes, carrito y proceso de compra requieren especificación propia en la fase 2.

Registrar pedidos de WhatsApp, Messenger o Instagram no implica importarlos automáticamente ni sincronizar conversaciones. Tampoco se ha acordado automatización de publicaciones en redes, integración con pasarelas de pago, seguimiento automático de couriers, emisión fiscal electrónica o control de asistencia del personal.

Las funciones propuestas y ampliaciones deben priorizarse con la responsable de la tienda antes de incluirse en una fecha de entrega.
