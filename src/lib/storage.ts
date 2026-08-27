/**
 * Safe LocalStorage helper module with hydration safety, corruption recovery, and item bounds.
 */

const FAVORITES_KEY = 'nmb_favorites';
const RECENTS_KEY = 'nmb_recents';
const MAX_FAVORITES = 100;
const MAX_RECENTS = 10;

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(FAVORITES_KEY);
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_FAVORITES);
  } catch (err) {
    console.error('Error reading favorites from localStorage:', err);
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (_) {}
    return [];
  }
}

export function saveFavorites(favs: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const safeFavs = Array.from(new Set(favs)).slice(0, MAX_FAVORITES);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(safeFavs));
  } catch (err) {
    console.error('Error saving favorites to localStorage:', err);
  }
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const index = current.indexOf(id);
  let updated: string[];
  if (index >= 0) {
    updated = current.filter((item) => item !== id);
  } else {
    updated = [...current, id];
  }
  saveFavorites(updated);
  return updated;
}

export function getRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(RECENTS_KEY);
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENTS);
  } catch (err) {
    console.error('Error reading recents from localStorage:', err);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch (_) {}
    return [];
  }
}

export function addRecent(id: string): string[] {
  if (typeof window === 'undefined' || !id) return [];
  const current = getRecents();
  const updated = [id, ...current.filter((item) => item !== id)].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving recents to localStorage:', err);
  }
  return updated;
}
