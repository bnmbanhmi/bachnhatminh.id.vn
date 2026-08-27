'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_HANOI_CENTER, DEFAULT_HCMC_CENTER, CityCode } from '@/lib/location';
import { useCityState } from '@/lib/city-state';

interface LocationRadiusMapProps {
  lat?: number;
  lng?: number;
  radiusM: number;
  onPointChange: (point: { lat: number; lng: number }) => void;
  activeCity?: CityCode;
}

function safeguardLeafletDomUtil() {
  if (typeof window === 'undefined' || !L || !(L as any).DomUtil) return;
  const domUtil = (L as any).DomUtil;
  if (domUtil._safeguardedPos) return;

  const originalGetPosition = domUtil.getPosition;
  domUtil.getPosition = function (el: HTMLElement) {
    if (!el) return new L.Point(0, 0);
    try {
      return originalGetPosition.call(this, el);
    } catch {
      return new L.Point(0, 0);
    }
  };

  const originalSetPosition = domUtil.setPosition;
  domUtil.setPosition = function (el: HTMLElement, point: L.Point) {
    if (!el) return;
    try {
      originalSetPosition.call(this, el, point);
    } catch {}
  };

  domUtil._safeguardedPos = true;
}

export default function LocationRadiusMap({
  lat,
  lng,
  radiusM,
  onPointChange,
  activeCity,
}: LocationRadiusMapProps) {
  const { activeCity: hookCity } = useCityState();
  const currentCity = activeCity || hookCity;
  const defaultCenter = currentCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const onPointChangeRef = useRef(onPointChange);
  const initialCenterRef = useRef({
    lat: lat ?? defaultCenter.lat,
    lng: lng ?? defaultCenter.lng,
    hasPoint: lat !== undefined && lng !== undefined,
  });

  useEffect(() => {
    onPointChangeRef.current = onPointChange;
  }, [onPointChange]);

  useEffect(() => {
    safeguardLeafletDomUtil();
    if (!containerRef.current || mapRef.current) return;
    const initial = initialCenterRef.current;
    const center: L.LatLngExpression = [initial.lat, initial.lng];
    const map = L.map(containerRef.current, {
      center,
      zoom: initial.hasPoint ? 14 : 12,
      zoomSnap: 0.25,
      zoomDelta: 1,
      wheelPxPerZoomLevel: 45,
      wheelDebounceTime: 25,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    map.on('click', (event: L.LeafletMouseEvent) => {
      onPointChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });
    mapRef.current = map;

    return () => {
      try {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (circleRef.current) {
          circleRef.current.remove();
          circleRef.current = null;
        }
      } catch {}
      try {
        map.stop();
        map.off();
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._loaded || lat === undefined || lng === undefined) return;

    try {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }

      markerRef.current = L.circleMarker([lat, lng], {
        radius: 7,
        color: '#1A1C1E',
        fillColor: '#B8422E',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

      circleRef.current = L.circle([lat, lng], {
        radius: radiusM,
        color: '#B8422E',
        fillColor: '#B8422E',
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      map.setView([lat, lng], radiusM <= 500 ? 15 : radiusM <= 1000 ? 14 : 13, { animate: false });
    } catch {}
  }, [lat, lng, radiusM]);

  return <div ref={containerRef} className="h-[320px] w-full rounded-sm border border-secondary" />;
}
