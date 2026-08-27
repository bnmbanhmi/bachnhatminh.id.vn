import { getWardCoordinatesByCode, type LocationSelection } from '@/lib/location';

export type FeedSortOrder = 'newest' | 'price_asc' | 'price_desc' | 'closest';

export const FEED_SORT_ORDERS: FeedSortOrder[] = ['newest', 'price_asc', 'price_desc', 'closest'];

export const FEED_SORT_OPTIONS: { value: FeedSortOrder; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'closest', label: 'Gần nhất' },
];

export function isFeedSortOrder(value: string | null | undefined): value is FeedSortOrder {
  return !!value && FEED_SORT_ORDERS.includes(value as FeedSortOrder);
}

export interface SortableFields {
  priceLow: number | null;
  priceHigh: number | null;
  date: number | null;
  distance: number | null;
}

function compareValues(a: number | null, b: number | null, ascending: boolean): number {
  const aNull = a === null;
  const bNull = b === null;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  return ascending ? a - b : b - a;
}

export function toTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

// Stable sort (input order preserved for ties). Null fields always sink to the bottom.
export function applyFeedSort<T>(
  items: T[],
  order: FeedSortOrder,
  getFields: (item: T) => SortableFields | null
): T[] {
  return [...items].sort((a, b) => {
    const fa = getFields(a);
    const fb = getFields(b);
    const aFields = fa || { priceLow: null, priceHigh: null, date: null, distance: null };
    const bFields = fb || { priceLow: null, priceHigh: null, date: null, distance: null };

    switch (order) {
      case 'price_asc':
        return compareValues(aFields.priceLow, bFields.priceLow, true);
      case 'price_desc':
        return compareValues(aFields.priceHigh, bFields.priceHigh, false);
      case 'closest':
        return compareValues(aFields.distance, bFields.distance, true);
      case 'newest':
      default:
        return compareValues(aFields.date, bFields.date, false);
    }
  });
}

// Derive a sort anchor from the active location selection: radius center first,
// else the first selected ward's coordinates.
export function locationSelectionAnchor(
  selection: LocationSelection | null
): { lat: number; lng: number } | null {
  if (!selection) return null;
  if (selection.type === 'radius') {
    return { lat: selection.lat, lng: selection.lng };
  }
  const code = selection.wardCode || (selection.wardCodes && selection.wardCodes[0]);
  if (code) {
    const coords = getWardCoordinatesByCode(code);
    if (coords) return coords;
  }
  return null;
}