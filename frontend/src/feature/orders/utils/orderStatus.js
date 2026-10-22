/**
 * Mapeadores y utilidades de estado de pedidos.
 * Traduce entre las etiquetas de UI en español y los enums de base de datos Neon.
 * Responsable: Zully
 */

export const ORDER_STATUSES = {
  PENDING: {
    code: 'PENDING',
    label: 'Pendiente',
    badgeClass: 'badge badge-neutral',
    nextAction: 'PREPARING',
    actionLabel: 'Iniciar Preparación',
  },
  PREPARING: {
    code: 'PREPARING',
    label: 'En Preparación',
    badgeClass: 'badge badge-amber',
    nextAction: 'SHIPPED',
    actionLabel: 'Despachar Envío',
  },
  SHIPPED: {
    code: 'SHIPPED',
    label: 'Enviado',
    badgeClass: 'badge badge-cyan',
    nextAction: 'DELIVERED',
    actionLabel: 'Marcar Entregado',
  },
  DELIVERED: {
    code: 'DELIVERED',
    label: 'Entregado',
    badgeClass: 'badge badge-emerald',
    nextAction: null,
    actionLabel: null,
  },
  CANCELLED: {
    code: 'CANCELLED',
    label: 'Cancelado',
    badgeClass: 'badge badge-rose',
    nextAction: null,
    actionLabel: null,
  },
};

// Normaliza cualquier string de estado (español o backend) al código canónico
export const normalizeStatus = (status) => {
  if (!status) return 'PENDING';
  const upper = status.toUpperCase().replace(/\s+/g, '_');
  if (upper === 'PENDIENTE') return 'PENDING';
  if (upper === 'EN_PREPARACION' || upper === 'EN_PREPARACIÓN') return 'PREPARING';
  if (upper === 'ENVIADO') return 'SHIPPED';
  if (upper === 'ENTREGADO') return 'DELIVERED';
  if (upper === 'CANCELADO') return 'CANCELLED';
  return ORDER_STATUSES[upper] ? upper : 'PENDING';
};

// Genera el enlace de WhatsApp con mensaje pre-rellenado amigable
export const buildWhatsAppUrl = (order) => {
  const rawPhone = order.customerPhone || order.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
  const code = order.orderCode || order.id || '';
  const customer = order.customerName || 'Cliente';
  const statusLabel = ORDER_STATUSES[normalizeStatus(order.shippingStatus || order.status)]?.label || 'Registrado';

  const text = encodeURIComponent(
    `Hola ${customer}, te saludamos de Tienda Prisma. Tu pedido #${code} se encuentra en estado: ${statusLabel}. ` +
    (order.courierCompany ? `Transporte: ${order.courierCompany} (${order.trackingNumber || 'En gestión'}). ` : '') +
    `¡Muchas gracias por tu compra!`
  );

  return `https://wa.me/${fullPhone}?text=${text}`;
};
