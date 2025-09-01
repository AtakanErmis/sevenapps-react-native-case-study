import { format, parseISO, isValid, Locale } from 'date-fns';

/**
 * Simple date formatter with i18n support
 * Usage: formatDate(date, 'PP', { locale: fr }) for French formatting
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'PP',
  options?: { locale?: Locale }
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }

  return format(dateObj, formatStr, options);
}
