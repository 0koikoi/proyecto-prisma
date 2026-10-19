/**
 * Interruptor mock/backend de los módulos POS y Caja.
 *
 * VITE_USE_BACKEND=true  -> usan la API de Spring Boot (/api/sales, /api/cash-register, /api/pos/catalog).
 * Cualquier otro valor   -> siguen con los datos mock en memoria (comportamiento por defecto).
 *
 * El backend exige un JWT en localStorage ('token'); mientras el login siga en modo mock
 * hay que obtener uno con POST /api/auth/login para probar con VITE_USE_BACKEND=true.
 */
// Por defecto conecta a la API real de Spring Boot; solo usa mock si se especifica 'false'.
export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND !== 'false';
