/**
 * Optimized singleton instance of Intl.NumberFormat for BRL currency.
 * Reusing a single instance avoids the high overhead of repeated object creation,
 * which is especially critical during high-frequency updates like animations.
 */
export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Utility function to format a number as BRL currency using the optimized singleton.
 */
export const formatBRL = (value: number) => BRL.format(value);

export const maskCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return BRL.format(numberValue);
};

export const parseCurrencyString = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};
