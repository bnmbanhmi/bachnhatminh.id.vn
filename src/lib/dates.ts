export function formatDisplayDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function formatMoveInDate(dateStr?: string | null): string | null {
  const date = formatDisplayDate(dateStr);
  return date || null;
}

export type DateFilterOption = 'all' | 'today' | '3d' | '7d' | '30d';

export const DEFAULT_DATE_FILTER: DateFilterOption = '3d';

export const DATE_FILTER_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: '3d', label: '3 ngày qua' },
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'all', label: 'Mọi thời điểm' },
];

export function isDateFilterOption(value: string | null | undefined): value is DateFilterOption {
  return !!value && ['all', 'today', '3d', '7d', '30d'].includes(value);
}

export function resolveDateFilter(value: string | null | undefined): DateFilterOption {
  if (value && isDateFilterOption(value)) return value;
  return DEFAULT_DATE_FILTER;
}

export function matchesDateFilter(
  dateValue: string | number | null | undefined,
  filter: DateFilterOption,
  nowMs: number = Date.now()
): boolean {
  if (!filter || filter === 'all') return true;
  if (!dateValue) return false;
  const timestamp = typeof dateValue === 'number' ? dateValue : new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return false;

  const diffMs = nowMs - timestamp;
  if (diffMs < 0) return true;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  switch (filter) {
    case 'today':
      return diffMs <= ONE_DAY_MS;
    case '3d':
      return diffMs <= 3 * ONE_DAY_MS;
    case '7d':
      return diffMs <= 7 * ONE_DAY_MS;
    case '30d':
      return diffMs <= 30 * ONE_DAY_MS;
    default:
      return true;
  }
}

