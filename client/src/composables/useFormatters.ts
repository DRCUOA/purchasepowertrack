const currencyFmt = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export function useFormatters() {
  function formatCurrency(value: number): string {
    return currencyFmt.format(value);
  }

  function formatPercent(value: number | null): string {
    if (value === null || value === undefined) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const idx = parseInt(month, 10) - 1;
    return `${MONTHS[idx]} ${year}`;
  }

  function formatChange(
    current: number | null,
    previous: number | null,
  ): { value: string; direction: 'up' | 'down' | 'flat' } {
    if (current === null || previous === null || previous === 0) {
      return { value: '—', direction: 'flat' };
    }
    const diff = current - previous;
    const pct = (diff / previous) * 100;
    const direction = pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'flat';
    const sign = diff > 0 ? '+' : '';
    return {
      value: `${sign}${formatCurrency(diff)} (${sign}${pct.toFixed(1)}%)`,
      direction,
    };
  }

  return { formatCurrency, formatPercent, formatDate, formatMonth, formatChange };
}
