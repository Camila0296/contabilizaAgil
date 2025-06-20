export const formatCurrency = (value: number, locale: string = 'es-CO', currency: string = 'COP'): string => {
  if (isNaN(value)) return '$0';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
};
