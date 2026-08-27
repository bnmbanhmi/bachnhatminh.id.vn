import {
  DEFAULT_HANOI_CENTER,
  DEFAULT_HCMC_CENTER,
  HANOI_UNITS,
  normalizeLocationText,
  getWardCoordinates,
  getWardCoordinatesByCode,
} from '@/lib/location';

export {
  DEFAULT_HANOI_CENTER,
  DEFAULT_HCMC_CENTER,
  getWardCoordinates,
  getWardCoordinatesByCode,
};

export function normalizeWardName(name: string): string {
  return normalizeLocationText(name);
}

export function getWard2CharCode(wardName: string | null | undefined): string {
  if (!wardName) return 'HN';
  const normalized = normalizeLocationText(wardName);
  return HANOI_UNITS.find((unit) => normalizeLocationText(unit.name) === normalized)?.code || 'HN';
}
