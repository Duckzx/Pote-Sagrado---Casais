const BRLFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number to BRL currency string using a centralized formatter.
 * Performance: Uses a singleton Intl.NumberFormat instance to avoid expensive re-instantiation.
 */
export const formatBRL = (value: number): string => {
  return BRLFormatter.format(value);
};

export const maskCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return BRLFormatter.format(numberValue);
};

export const parseCurrencyString = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};
