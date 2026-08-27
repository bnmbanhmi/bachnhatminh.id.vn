'use client';

import { useEffect, useCallback, useTransition, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CityCode, DEFAULT_CITY, CITIES } from './location';

const STORAGE_KEY = 'nmb_city';
const CITY_CHANGE_EVENT = 'nmb:city-change';

export function normalizeCity(value: string | null | undefined): CityCode {
  if (!value) return DEFAULT_CITY;
  const lower = value.trim().toLowerCase();
  if (lower === 'sg' || lower === 'saigon' || lower === 'hcm' || lower === 'tphcm') {
    return 'SG';
  }
  if (lower === 'hn' || lower === 'hanoi' || lower === 'ha-noi') {
    return 'HN';
  }
  return DEFAULT_CITY;
}

function subscribeCityStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(CITY_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CITY_CHANGE_EVENT, callback);
  };
}

function getStoredCitySnapshot(): CityCode {
  if (typeof window === 'undefined') return DEFAULT_CITY;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return normalizeCity(stored);
  } catch {
    return DEFAULT_CITY;
  }
}

function getServerCitySnapshot(): CityCode {
  return DEFAULT_CITY;
}

export function useCityState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const urlCityParam = searchParams?.get('city');
  const storedCity = useSyncExternalStore(
    subscribeCityStorage,
    getStoredCitySnapshot,
    getServerCitySnapshot
  );

  // Derive active city: URL parameter takes priority, otherwise use post-hydration local preference
  const activeCity: CityCode = urlCityParam ? normalizeCity(urlCityParam) : storedCity;

  // Sync URL city parameter to localStorage if present
  useEffect(() => {
    if (urlCityParam) {
      const normalized = normalizeCity(urlCityParam);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, normalized.toLowerCase());
        } catch {
          // Ignore localStorage errors
        }
      }
    }
  }, [urlCityParam]);

  const setCity = useCallback(
    (newCity: CityCode) => {
      const cityKey = newCity.toLowerCase();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, cityKey);
        } catch {
          // Ignore localStorage errors
        }
        window.dispatchEvent(new CustomEvent(CITY_CHANGE_EVENT, { detail: newCity }));
      }

      // Update URL search params
      const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : '');
      currentParams.set('city', cityKey);
      
      // If there was a specific ward/location filter from the other city, clear it
      currentParams.delete('ward');
      currentParams.delete('loc_lat');
      currentParams.delete('loc_lng');
      currentParams.delete('loc_r');
      currentParams.delete('building');
      currentParams.delete('post');
      currentParams.delete('profile');

      startTransition(() => {
        router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  return {
    activeCity,
    setCity,
    isPending,
    cityConfig: CITIES[activeCity],
  };
}
