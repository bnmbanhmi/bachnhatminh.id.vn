'use client';

import { useEffect, useState } from 'react';
import { locationSelectionAnchor } from '@/lib/sorting';
import type { LocationSelection } from '@/lib/location';

// Sort anchor for "Gần nhất": the active location selection when present,
// otherwise a one-shot device GPS fix (required only when closest is active
// and no location selection exists).
export function useGeoAnchor(
  selection: LocationSelection | null,
  active: boolean
): { lat: number; lng: number } | null {
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    if (locationSelectionAnchor(selection)) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!cancelled) {
          setGps({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      },
      () => {},
      { timeout: 8000, maximumAge: 600000, enableHighAccuracy: false }
    );
    return () => {
      cancelled = true;
    };
  }, [active, selection]);

  return locationSelectionAnchor(selection) ?? gps;
}