export const formatCurrency = (value: number, locale: string = 'es-CO', currency: string = 'COP'): string => {
  if (isNaN(value)) return '$0';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
};

// Las fechas de facturas se guardan sin hora (medianoche UTC). Se formatean en UTC
// para que no se muestren con un día menos en zonas horarias negativas (Colombia UTC-5).
export const formatFecha = (fecha: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = {}, locale?: string): string => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { ...options, timeZone: 'UTC' });
};
