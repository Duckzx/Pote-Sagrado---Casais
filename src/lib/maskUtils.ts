/**
 * Singleton instance for BRL currency formatting.
 * Reusing this instance is more performant than creating new ones,
 * especially in animations (like AnimatedNumber).
 */
export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatBRL = (value: number): string => BRL.format(value);

export const maskCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return formatBRL(numberValue);
};

export const parseCurrencyString = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};
