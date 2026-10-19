/**
 * Utilidades de validación y sanitización para formularios.
 * Adaptado a estándares comerciales y tributarios peruanos (RUC, DNI, Celular).
 * Responsable: Zully (Líder del Proyecto)
 */

/**
 * Valida si un número telefónico es un celular válido de Perú:
 * Debe empezar obligatoriamente con el número 9 y contener exactamente 9 dígitos numéricos.
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPeruvianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  return /^9\d{8}$/.test(cleanPhone);
};

/**
 * Sanitiza la entrada de un teléfono en tiempo real:
 * - Filtra caracteres no numéricos
 * - Trunca a un máximo de 9 dígitos
 * @param {string} value
 * @returns {string}
 */
export const sanitizePhoneInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 9);
};

/**
 * Valida un nombre de persona o cliente:
 * Debe tener entre 3 y 80 caracteres y contener solo letras, tildes, diéresis, espacios y guiones.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidPersonName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 80) return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed);
};

/**
 * Valida RUC peruano (11 dígitos numéricos, comúnmente iniciando con 10 o 20)
 * @param {string} ruc
 * @returns {boolean}
 */
export const isValidRuc = (ruc) => {
  if (!ruc || typeof ruc !== 'string') return false;
  const clean = ruc.trim();
  return /^\d{11}$/.test(clean);
};

/**
 * Valida DNI peruano (8 dígitos numéricos)
 * @param {string} dni
 * @returns {boolean}
 */
export const isValidDni = (dni) => {
  if (!dni || typeof dni !== 'string') return false;
  const clean = dni.trim();
  return /^\d{8}$/.test(clean);
};

/**
 * Sanitiza entradas puramente numéricas con longitud máxima
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export const sanitizeNumericInput = (value, maxLength = 11) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, maxLength);
};
