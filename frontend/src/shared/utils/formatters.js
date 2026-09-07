export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};
