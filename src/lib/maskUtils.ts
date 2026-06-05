/**
 * ⚡ BOLT OPTIMIZATION: Singleton Intl.NumberFormat
 * Reusing a single instance of Intl.NumberFormat instead of creating new ones in every component render.
 * This significantly reduces memory overhead and CPU cycles, especially in frequently re-rendering components
 * like AnimatedNumber or during Remotion video rendering.
 */
export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as BRL currency using the optimized singleton.
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
