import { format, parseISO, isValid } from 'date-fns';

/**
 * Simple date formatter with i18n support
 * Usage: formatDate(date, 'PP', { locale: fr }) for French formatting
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'PP',
  options?: { locale?: any }
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }

  return format(dateObj, formatStr, options);
}
