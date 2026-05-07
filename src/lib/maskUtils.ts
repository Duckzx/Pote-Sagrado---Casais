// Singleton instance to avoid repeated initialization costs
// This provides a significant performance boost in animations and large lists
const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as BRL currency using a singleton Intl.NumberFormat instance.
 * @param value The number to format
 * @returns Formatted currency string
 */
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
