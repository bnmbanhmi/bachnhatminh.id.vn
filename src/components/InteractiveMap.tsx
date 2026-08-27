'use client';

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getWardCoordinates,
  getWardCoordinatesByCode,
  isWithinCityBounds,
  DEFAULT_HANOI_CENTER,
  DEFAULT_HCMC_CENTER,
  CityCode,
  formatDesiredWardDisplay,
} from '@/lib/location';
import { trackMapInteraction } from '@/lib/telemetry';

export { DEFAULT_HANOI_CENTER, DEFAULT_HCMC_CENTER };

export interface MapListingPin {
  id: string;
  postId?: string;
  shortId?: string;
  targetPostId?: string;
  buildingId?: string;
  /** @deprecated legacy alias */
  houseId?: string;
  title: string;
  price: number;
  verificationTier?: number;
  locationText: string;
  elasticId?: string;
  lat?: number;
  lng?: number;
  media?: string[];
  riskLabels?: string[];
  roughArea?: number | null;
  description?: string | null;
  postType?: string;
  authorRole?: string | null;
  sourceType?: string | null;
  badgeText?: string | null;
  moveInDate?: string | null;
  genderPref?: string | null;
  priceDisplay?: string;
  areaDisplay?: string;
}

export interface MapReviewPin {
  id: string;
  postId?: string;
  shortId?: string;
  targetPostId?: string;
  buildingId?: string;
  /** @deprecated legacy alias */
  houseId?: string;
  address: string;
  riskLabels: string[];
  reviewCount?: number;
  snippet?: string;
  rating?: number;
  price?: number;
  reviewerRole?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  authorName?: string | null;
  lat?: number;
  lng?: number;
}

export interface MapRoommatePin {
  id: string;
  shortId?: string | null;
  buildingId?: string | null;
  addressRaw?: string | null;
  roomState?: string | null;
  price?: number | null;
  priceUnit?: string | null;
  desiredWard: string | null;
  desiredLocationType?: string | null;
  budgetMin: number;
  budgetMax: number;
  genderPref: string;
  createdAt?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  lat?: number;
  lng?: number;
  desiredWardCodes?: string[];
  desiredRadiusM?: number;
}

interface InteractiveMapProps {
  listingPins?: MapListingPin[];
  reviewPins?: MapReviewPin[];
  roommatePins?: MapRoommatePin[];
  height?: string;
  isPickingLocation?: boolean;
  pickingMode?: 'radius' | 'point';
  selectedPoint?: { lat: number; lng: number };
  selectedRadiusM?: number;
  onPointSelect?: (point: { lat: number; lng: number }) => void;
  onRadiusSelect?: (radiusM: number) => void;
  onClosePicker?: () => void;
  hoveredPinId?: string | null;
  selectedBuildingId?: string | null;
  onSelectBuilding?: (buildingId: string, reviewId?: string) => void;
  selectedPostId?: string | null;
  selectedProfileId?: string | null;
  onSelectProfile?: (profileId: string) => void;
  activeCity?: CityCode;
  /** @deprecated legacy aliases */
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string, reviewId?: string) => void;
}

function formatRadius(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  const km = meters / 1000;
  const formatted = Number.isInteger(km) ? String(km) : String(km).replace('.', ',');
  return `${formatted}km`;
}

function safeguardLeafletDomUtil() {
  if (typeof window === 'undefined' || !L || !(L as any).DomUtil) return;
  const domUtil = (L as any).DomUtil;
  if (domUtil._safeguardedPos) return;

  const originalGetPosition = domUtil.getPosition;
  domUtil.getPosition = function (el: HTMLElement) {
    if (!el) {
      return new L.Point(0, 0);
    }
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
    } catch {
      // Prevent crash if target element is detached or null
    }
  };

  domUtil._safeguardedPos = true;
}

/**
 * Calculates padding (in map container pixels) corresponding to the visible fraction
 * of the map element inside the browser viewport, accounting for window scroll and BottomSheet overlays.
 */
function getVisibleMapViewportPadding(mapContainer: HTMLElement | null): {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
  visibleCenterPx: { x: number; y: number };
  mapCenterPx: { x: number; y: number };
} {
  const fallback = {
    paddingTopLeft: [30, 30] as [number, number],
    paddingBottomRight: [30, 30] as [number, number],
    visibleCenterPx: { x: 150, y: 150 },
    mapCenterPx: { x: 150, y: 150 },
  };

  if (!mapContainer || typeof window === 'undefined') return fallback;

  const rect = mapContainer.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  if (rect.width <= 0 || rect.height <= 0) return fallback;

  // Check if map container is completely off-screen
  if (rect.bottom <= 0 || rect.top >= vh || rect.right <= 0 || rect.left >= vw) {
    return {
      paddingTopLeft: [30, 30],
      paddingBottomRight: [30, 30],
      visibleCenterPx: { x: rect.width / 2, y: rect.height / 2 },
      mapCenterPx: { x: rect.width / 2, y: rect.height / 2 },
    };
  }

  // Check for BottomSheet overlay on mobile (< 1024px)
  let sheetTopV = vh;
  if (vw < 1024) {
    const sheetEl = document.querySelector('[data-bottom-sheet="true"]');
    if (sheetEl) {
      const sheetRect = sheetEl.getBoundingClientRect();
      if (sheetRect.top > 0 && sheetRect.top < vh) {
        sheetTopV = sheetRect.top;
      }
    }
  }

  // Visible map bounds in viewport coordinates
  const visTopV = Math.max(0, rect.top);
  const visBottomV = Math.min(vh, sheetTopV, rect.bottom);
  const visLeftV = Math.max(0, rect.left);
  const visRightV = Math.min(vw, rect.right);

  // Visible bounds in map container local coordinates
  const visTopContainer = Math.max(0, visTopV - rect.top);
  let visBottomContainer = Math.min(rect.height, visBottomV - rect.top);
  const visLeftContainer = Math.max(0, visLeftV - rect.left);
  let visRightContainer = Math.min(rect.width, visRightV - rect.left);

  // Ensure minimum height/width window if map is heavily squeezed
  if (visBottomContainer - visTopContainer < 40) {
    visBottomContainer = Math.min(rect.height, visTopContainer + 40);
  }
  if (visRightContainer - visLeftContainer < 40) {
    visRightContainer = Math.min(rect.width, visLeftContainer + 40);
  }

  const paddingTop = Math.max(15, visTopContainer + 20);
  const paddingBottom = Math.max(15, (rect.height - visBottomContainer) + 20);
  const paddingLeft = Math.max(15, visLeftContainer + 20);
  const paddingRight = Math.max(15, (rect.width - visRightContainer) + 20);

  const visibleCenterPx = {
    x: (visLeftContainer + visRightContainer) / 2,
    y: (visTopContainer + visBottomContainer) / 2,
  };

  const mapCenterPx = {
    x: rect.width / 2,
    y: rect.height / 2,
  };

  return {
    paddingTopLeft: [paddingLeft, paddingTop],
    paddingBottomRight: [paddingRight, paddingBottom],
    visibleCenterPx,
    mapCenterPx,
  };
}

/**
 * Recenters the map on latlng such that latlng appears at the center of the visible fraction of the map container.
 */
function recenterLocationInVisibleMap(
  map: L.Map | null,
  mapContainer: HTMLElement | null,
  latlng: L.LatLngExpression,
  animate = true
) {
  if (!map || !(map as any)._loaded || !mapContainer) return;

  try {
    const { visibleCenterPx, mapCenterPx } = getVisibleMapViewportPadding(mapContainer);

    // dx, dy is the vector from map container center to visible center
    const dx = visibleCenterPx.x - mapCenterPx.x;
    const dy = visibleCenterPx.y - mapCenterPx.y;

    const zoom = map.getZoom();
    const targetLatLng = L.latLng(latlng);
    const targetPx = map.project(targetLatLng, zoom);

    // To render targetLatLng at visibleCenterPx instead of mapCenterPx,
    // the required map center pixel is offset by (mapCenterPx - visibleCenterPx) = (-dx, -dy)
    const newCenterPx = L.point(targetPx.x - dx, targetPx.y - dy);
    const newCenterLatLng = map.unproject(newCenterPx, zoom);

    map.panTo(newCenterLatLng, { animate });
  } catch {
    try {
      map.panTo(latlng, { animate });
    } catch {}
  }
}

const STATIC_SCREEN_RADIUS_PX = 120;

function getRadiusFromZoom(map: L.Map, screenRadiusPx: number = STATIC_SCREEN_RADIUS_PX): number {
  try {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const latRad = (center.lat * Math.PI) / 180;
    const metersPerPx = (156543.03392 * Math.cos(latRad)) / Math.pow(2, zoom);
    const rawMeters = screenRadiusPx * metersPerPx;

    let rounded: number;
    if (rawMeters <= 300) {
      rounded = Math.round(rawMeters / 25) * 25;
    } else if (rawMeters <= 800) {
      rounded = Math.round(rawMeters / 50) * 50;
    } else if (rawMeters <= 2000) {
      rounded = Math.round(rawMeters / 100) * 100;
    } else {
      rounded = Math.round(rawMeters / 250) * 250;
    }
    return Math.max(100, Math.min(5000, rounded));
  } catch {
    return 1000;
  }
}

function getZoomFromRadius(map: L.Map, radiusM: number, screenRadiusPx: number = STATIC_SCREEN_RADIUS_PX): number {
  try {
    const center = map.getCenter();
    const latRad = (center.lat * Math.PI) / 180;
    const metersPerPxAtZoom0 = 156543.03392 * Math.cos(latRad);
    const boundedRadius = Math.max(100, Math.min(5000, radiusM));
    const targetMetersPerPx = boundedRadius / screenRadiusPx;
    const targetZoom = Math.log2(metersPerPxAtZoom0 / targetMetersPerPx);
    return Math.max(10, Math.min(19, targetZoom));
  } catch {
    return 14;
  }
}

export default function InteractiveMap({
  listingPins = [],
  reviewPins = [],
  roommatePins = [],
  height = '420px',
  isPickingLocation = false,
  pickingMode = 'radius',
  selectedPoint,
  selectedRadiusM = 1000,
  onPointSelect,
  onRadiusSelect,
  onClosePicker,
  hoveredPinId,
  selectedBuildingId,
  onSelectBuilding,
  selectedPostId,
  selectedProfileId,
  onSelectProfile,
  activeCity = 'HN',
  selectedPlaceId,
  onSelectPlace,
}: InteractiveMapProps) {
  const activeSelectedId = selectedBuildingId || selectedPlaceId || selectedProfileId || selectedPostId;
  const handleBuildingSelection = onSelectBuilding || onSelectPlace;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const pickerMarkerRef = useRef<L.CircleMarker | null>(null);
  const pickerCircleRef = useRef<L.Circle | null>(null);
  const latestBoundsRef = useRef<L.LatLngBounds | null>(null);
  const onPointSelectRef = useRef(onPointSelect);
  onPointSelectRef.current = onPointSelect;
  const onRadiusSelectRef = useRef(onRadiusSelect);
  onRadiusSelectRef.current = onRadiusSelect;
  const prevPickingRef = useRef(false);
  const [liveRadiusM, setLiveRadiusM] = useState<number>(selectedRadiusM || 1000);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (selectedRadiusM) {
      setLiveRadiusM(selectedRadiusM);
    }
  }, [selectedRadiusM]);

  const isPointMode = pickingMode === 'point' || selectedRadiusM === 0;

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }
    trackMapInteraction({ interaction_type: 'locate_me_gps' });
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (onPointSelect) {
          onPointSelect({ lat, lng });
        }
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15, { animate: true });
        }
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    safeguardLeafletDomUtil();
    // Fix default marker icon paths in Next.js / webpack packaging
    // @ts-expect-error: Default icon prototype does not have type definition for _getIconUrl
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Master Map Lifecycle & ResizeObserver
  useEffect(() => {
    safeguardLeafletDomUtil();
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const initCenter = activeCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;
      const map = L.map(mapContainerRef.current, {
        center: [initCenter.lat, initCenter.lng],
        zoom: 13,
        zoomSnap: 0.25,
        zoomDelta: 1,
        wheelPxPerZoomLevel: 45,
        wheelDebounceTime: 25,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
    }

    const container = mapContainerRef.current;
    const observer = new ResizeObserver(() => {
      if (mapRef.current && (mapRef.current as any)._loaded && container && document.body.contains(container)) {
        try {
          mapRef.current.invalidateSize({ animate: false });
        } catch {
          // Ignore size recalculation errors if container is detached
        }
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();

      // Clear picker overlays safely
      try {
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.remove();
          pickerMarkerRef.current = null;
        }
        if (pickerCircleRef.current) {
          pickerCircleRef.current.remove();
          pickerCircleRef.current = null;
        }
      } catch {}

      // Clear feature markers safely
      try {
        markersRef.current.forEach((marker) => {
          try {
            marker.off();
            marker.remove();
          } catch {}
        });
      } catch {}
      markersRef.current = [];
      markerMapRef.current.clear();

      // Safely destroy Leaflet Map instance
      if (mapRef.current) {
        try {
          mapRef.current.stop();
          mapRef.current.off();
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, []);

  // Synchronize city changes when user toggles city filter
  const prevCityRef = useRef<CityCode>(activeCity);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._loaded) return;
    if (prevCityRef.current !== activeCity) {
      prevCityRef.current = activeCity;
      latestBoundsRef.current = null;
      if (!isPickingLocation && !selectedPoint && !activeSelectedId) {
        const cityCenter = activeCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;
        map.setView([cityCenter.lat, cityCenter.lng], 13, { animate: false });
      }
    }
  }, [activeCity, isPickingLocation, selectedPoint, activeSelectedId]);

  // Center-locked Location/Address Picking via Map Pan & Zoom + Zoom-to-Radius Sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._loaded || !isPickingLocation) {
      if (map && (map as any)._loaded) {
        // Restore unrestricted zoom range outside picking mode
        map.setMinZoom(10);
        map.setMaxZoom(19);
      }
      prevPickingRef.current = isPickingLocation;
      return;
    }

    const wasPicking = prevPickingRef.current;
    prevPickingRef.current = isPickingLocation;

    // Apply strict zoom bounds in radius picking mode to prevent dead zones
    if (!isPointMode) {
      const minRadiusZoom = Math.floor(getZoomFromRadius(map, 5000) * 4) / 4;
      const maxRadiusZoom = Math.ceil(getZoomFromRadius(map, 100) * 4) / 4;
      map.setMinZoom(minRadiusZoom);
      map.setMaxZoom(maxRadiusZoom);
    } else {
      map.setMinZoom(10);
      map.setMaxZoom(19);
    }

    // Check if map center needs synchronization with selectedPoint
    if (selectedPoint?.lat && selectedPoint?.lng) {
      const currentCenter = map.getCenter();
      const distLat = Math.abs(currentCenter.lat - selectedPoint.lat);
      const distLng = Math.abs(currentCenter.lng - selectedPoint.lng);
      const isExternalChange = !wasPicking || distLat > 0.0001 || distLng > 0.0001;

      if (isExternalChange) {
        const center: L.LatLngExpression = [selectedPoint.lat, selectedPoint.lng];
        if (!isPointMode) {
          const targetZoom = getZoomFromRadius(map, selectedRadiusM || 1000);
          map.setView(center, targetZoom, { animate: false });
          setLiveRadiusM(selectedRadiusM || 1000);
        } else {
          const targetZoom = Math.max(map.getZoom() || 15, 15);
          map.setView(center, targetZoom, { animate: false });
        }
      }
    } else if (!wasPicking) {
      if (!isPointMode) {
        const targetZoom = getZoomFromRadius(map, selectedRadiusM || 1000);
        map.setView(map.getCenter(), targetZoom, { animate: false });
        setLiveRadiusM(selectedRadiusM || 1000);
      }
    }

    const handleMapMoveEnd = () => {
      const center = map.getCenter();
      onPointSelectRef.current?.({ lat: center.lat, lng: center.lng });
    };

    const handleMapZoom = () => {
      if (!isPointMode && onRadiusSelectRef.current) {
        const newRadius = getRadiusFromZoom(map);
        setLiveRadiusM(newRadius);
        onRadiusSelectRef.current?.(newRadius);
      }
    };

    map.on('moveend', handleMapMoveEnd);
    map.on('zoom', handleMapZoom);
    map.on('zoomend', handleMapZoom);

    return () => {
      try {
        map.off('moveend', handleMapMoveEnd);
        map.off('zoom', handleMapZoom);
        map.off('zoomend', handleMapZoom);
      } catch {}
    };
  }, [isPickingLocation, isPointMode, selectedPoint?.lat, selectedPoint?.lng, selectedRadiusM]);

  // Handle Location Marker & Radius Circle Overlay (for normal view mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._loaded) return;

    if (isPickingLocation) {
      // In active picking mode: screen reticle overlay handles point + static radius circle
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
      if (pickerCircleRef.current) {
        pickerCircleRef.current.remove();
        pickerCircleRef.current = null;
      }
    } else if (selectedPoint) {
      // Normal display mode: render static marker & circle at selectedPoint
      try {
        if (!pickerMarkerRef.current) {
          pickerMarkerRef.current = L.circleMarker([selectedPoint.lat, selectedPoint.lng], {
            radius: 8,
            color: '#b8422e',
            fillColor: '#b8422e',
            fillOpacity: 1,
            weight: 3,
          }).addTo(map);
        } else {
          pickerMarkerRef.current.setLatLng([selectedPoint.lat, selectedPoint.lng]);
        }

        if (!selectedRadiusM || selectedRadiusM <= 0) {
          if (pickerCircleRef.current) {
            pickerCircleRef.current.remove();
            pickerCircleRef.current = null;
          }
        } else {
          if (!pickerCircleRef.current) {
            pickerCircleRef.current = L.circle([selectedPoint.lat, selectedPoint.lng], {
              radius: selectedRadiusM,
              color: '#b8422e',
              fillColor: '#b8422e',
              fillOpacity: 0.15,
              weight: 2,
            }).addTo(map);
          } else {
            pickerCircleRef.current.setLatLng([selectedPoint.lat, selectedPoint.lng]);
            pickerCircleRef.current.setRadius(selectedRadiusM);
          }
        }

        // Recenter visible map viewport to selected point ONLY in normal mode (not picking)
        recenterLocationInVisibleMap(map, mapContainerRef.current, [selectedPoint.lat, selectedPoint.lng], true);
      } catch {}
    } else {
      try {
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.remove();
          pickerMarkerRef.current = null;
        }
        if (pickerCircleRef.current) {
          pickerCircleRef.current.remove();
          pickerCircleRef.current = null;
        }
      } catch {}
    }
  }, [isPickingLocation, isPointMode, selectedPoint?.lat, selectedPoint?.lng, selectedRadiusM]);


  // Click outside & Escape key handler to exit picking mode
  useEffect(() => {
    if (!isPickingLocation || !onClosePicker) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const targetNode = e.target as Node | null;
      if (wrapperRef.current && targetNode && !wrapperRef.current.contains(targetNode)) {
        const isPickerControl = (targetNode as HTMLElement).closest?.('[data-map-picker-controls]');
        if (!isPickerControl) {
          onClosePicker();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClosePicker();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickingLocation, onClosePicker]);

  // Render Normal Feature Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._loaded) return;

    // Clear existing markers safely
    markersRef.current.forEach((marker) => {
      try {
        marker.off();
        marker.remove();
      } catch {}
    });
    markersRef.current = [];
    markerMapRef.current.clear();

    const bounds = L.latLngBounds([]);
    const usedCoords: Record<string, number> = {};

    // Helper for coordinate jitter offset when multiple markers target the same ward
    const getAdjustedCoords = (rawLat: number, rawLng: number) => {
      const coordKey = `${rawLat.toFixed(4)},${rawLng.toFixed(4)}`;
      if (usedCoords[coordKey] !== undefined) {
        usedCoords[coordKey] += 1;
        const count = usedCoords[coordKey];
        const angle = count * (360 / 8) * (Math.PI / 180);
        const radius = 0.0025 * Math.ceil(count / 8);
        return {
          lat: rawLat + Math.sin(angle) * radius,
          lng: rawLng + Math.cos(angle) * radius,
        };
      } else {
        usedCoords[coordKey] = 0;
        return { lat: rawLat, lng: rawLng };
      }
    };

    // Standardized Circle / Dynamic Pill Pin Helper (Price badge pin or circle icon)
    const createCirclePin = (bgColor: string, symbol: string = '') => {
      const isPill = symbol.length > 2;
      const pillWidth = isPill ? Math.max(40, Math.ceil(symbol.length * 7.2 + 16)) : 24;
      return L.divIcon({
        className: 'custom-circle-pin',
        html: `<div style="background-color: ${bgColor}; color: white; ${isPill ? 'padding: 3px 8px; height: 24px; border-radius: 12px;' : 'width: 24px; height: 24px; border-radius: 50%;'} display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35); font-family: Space Grotesk, system-ui, sans-serif; white-space: nowrap;">${symbol}</div>`,
        iconSize: [pillWidth, 24],
        iconAnchor: [Math.floor(pillWidth / 2), 12],
        popupAnchor: [0, -14],
      });
    };

    // Minimal Leaflet Address Tooltip Builder
    const renderLeafletPopup = (title: string): string => {
      return `
        <div style="font-weight: 700; font-size: 12px; color: #1a1c1e; padding: 2px 4px; font-family: system-ui, -apple-system, sans-serif; white-space: nowrap; max-width: 320px; overflow: hidden; text-overflow: ellipsis; text-align: center;">
          ${title}
        </div>
      `;
    };

    // 1. Render Review Pins (Color Matrix: 1-2 stars/risk -> Red, 4-5 stars -> Green, Neutral -> Yellow)
    reviewPins.forEach((pin) => {
      const targetBuildingId = pin.buildingId || pin.houseId || '';
      let baseCoords: { lat: number; lng: number } | null = null;
      if (pin.lat && pin.lng && pin.lat !== 0 && pin.lng !== 0) {
        baseCoords = { lat: pin.lat, lng: pin.lng };
      } else {
        baseCoords = getWardCoordinatesByCode(targetBuildingId, activeCity) || getWardCoordinates(pin.address, activeCity);
      }

      if (!baseCoords || !isWithinCityBounds(baseCoords.lat, baseCoords.lng, activeCity)) return; // Do not plot fake center points or out-of-city points

      const adjusted = getAdjustedCoords(baseCoords.lat, baseCoords.lng);
      if (!isWithinCityBounds(adjusted.lat, adjusted.lng, activeCity)) return;

      const isCriticalRisk = pin.riskLabels && pin.riskLabels.length > 0;
      const rating = pin.rating;
      const hasReviews = (pin.reviewCount !== undefined && pin.reviewCount > 0) || (rating !== undefined && rating !== null);

      let pinColor = '#eab308'; // Default yellow for neutral/null rating
      let pinSymbol = '!';

      if (!hasReviews && pin.price && pin.price > 0) {
        // If building does not have reviews, use price pill icon (like in building tab)
        pinColor = '#1a1c1e';
        pinSymbol = (pin.price >= 1000000)
          ? `${(pin.price / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`
          : `${Math.round(pin.price / 1000)}k`;
      } else if (isCriticalRisk || (rating !== undefined && rating !== null && rating <= 2)) {
        pinColor = '#dc2626'; // Red for phốt / 1-2 star reviews
        pinSymbol = '!';
      } else if (rating !== undefined && rating !== null && rating >= 4) {
        pinColor = '#16a34a'; // Green for positive 4-5 star reviews
        pinSymbol = '!';
      }

      const pinIcon = createCirclePin(pinColor, pinSymbol);

      const marker = L.marker([adjusted.lat, adjusted.lng], { icon: pinIcon }).addTo(map);

      const targetPath = (targetBuildingId || pin.id).toLowerCase();
      const popupAddress = pin.address || (activeCity === 'SG' ? 'Sài Gòn' : 'Hà Nội');

      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
      const popupContent = renderLeafletPopup(popupAddress);

      marker.bindPopup(popupContent, { closeButton: false, offset: [0, 0] });
      if (!isMobileDevice) {
        marker.on('mouseover', () => {
          try { marker.openPopup(); } catch {}
        });
        marker.on('mouseout', () => {
          try { marker.closePopup(); } catch {}
        });
      }

      marker.on('click', () => {
        try {
          recenterLocationInVisibleMap(map, mapContainerRef.current, [adjusted.lat, adjusted.lng], true);
        } catch {}
        trackMapInteraction({
          tab: 'review',
          interaction_type: 'pin_tap',
          target_id: targetPath || pin.id,
        });
        if (handleBuildingSelection) {
          const targetPost = pin.postId || pin.targetPostId || (pin.id !== pin.buildingId ? pin.id : undefined);
          handleBuildingSelection(targetPath, targetPost);
        }
      });
      markersRef.current.push(marker);
      if (pin.id) {
        markerMapRef.current.set(pin.id, marker);
        markerMapRef.current.set(pin.id.toLowerCase(), marker);
        markerMapRef.current.set(pin.id.toUpperCase(), marker);
      }
      if (pin.postId) {
        markerMapRef.current.set(pin.postId, marker);
        markerMapRef.current.set(pin.postId.toLowerCase(), marker);
        markerMapRef.current.set(pin.postId.toUpperCase(), marker);
      }
      if (pin.targetPostId) {
        markerMapRef.current.set(pin.targetPostId, marker);
        markerMapRef.current.set(pin.targetPostId.toLowerCase(), marker);
        markerMapRef.current.set(pin.targetPostId.toUpperCase(), marker);
      }
      if (pin.houseId) {
        markerMapRef.current.set(pin.houseId, marker);
        markerMapRef.current.set(pin.houseId.toLowerCase(), marker);
        markerMapRef.current.set(pin.houseId.toUpperCase(), marker);
      }
      if (pin.buildingId) {
        markerMapRef.current.set(pin.buildingId, marker);
        markerMapRef.current.set(pin.buildingId.toLowerCase(), marker);
        markerMapRef.current.set(pin.buildingId.toUpperCase(), marker);
      }
      bounds.extend([adjusted.lat, adjusted.lng]);
    });

    // 2. Render Roommate Pins (Blue Spectrum: Royal Blue #1d4ed8 for room supply, Sky Blue #0284c7 for seekers)
    roommatePins.forEach((pin) => {
      let coords: { lat: number; lng: number } | null = null;
      if (pin.lat !== undefined && pin.lat !== null && pin.lng !== undefined && pin.lng !== null && pin.lat !== 0 && pin.lng !== 0) {
        coords = { lat: pin.lat, lng: pin.lng };
      }
      if (!coords && pin.desiredWardCodes) {
        const rawCodes = pin.desiredWardCodes as unknown;
        const wardCodes: string[] = Array.isArray(rawCodes)
          ? (rawCodes as string[])
          : typeof rawCodes === 'string'
          ? (rawCodes.startsWith('[') ? JSON.parse(rawCodes) : [rawCodes])
          : [];
        if (wardCodes.length > 0) {
          coords = getWardCoordinatesByCode(wardCodes[0], activeCity);
        }
      }
      if (!coords && pin.desiredWard) {
        const radiusMatch = pin.desiredWard.match(/\[radius:([\d\.\-]+),([\d\.\-]+),(\d+)\]/);
        if (radiusMatch) {
          coords = { lat: parseFloat(radiusMatch[1]), lng: parseFloat(radiusMatch[2]) };
        } else {
          coords = getWardCoordinates(pin.desiredWard, activeCity) || getWardCoordinatesByCode(pin.desiredWard, activeCity);
        }
      }
      if (!coords && pin.addressRaw) {
        coords = getWardCoordinates(pin.addressRaw, activeCity);
      }
      if (!coords && pin.buildingId) {
        coords = getWardCoordinatesByCode(pin.buildingId, activeCity) || getWardCoordinates(pin.buildingId, activeCity);
      }
      if (!coords || !isWithinCityBounds(coords.lat, coords.lng, activeCity)) return;
      const adjusted = getAdjustedCoords(coords.lat, coords.lng);
      if (!isWithinCityBounds(adjusted.lat, adjusted.lng, activeCity)) return;

      const hasRoom = Boolean(pin.buildingId || pin.roomState === 'has_room');
      const pinColor = hasRoom ? '#1d4ed8' : '#0284c7';

      let budgetBadge = 'Ở ghép';
      if (pin.price && pin.price > 0) {
        budgetBadge = pin.price >= 1000000
          ? `${(pin.price / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
          : `${Math.round(pin.price / 1000)}k`;
      } else {
        const minText = pin.budgetMin > 0 ? (pin.budgetMin / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '';
        const maxText = pin.budgetMax > 0 ? (pin.budgetMax / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '';
        if (minText && maxText) {
          budgetBadge = minText === maxText ? `${minText}tr` : `${minText} - ${maxText}tr`;
        } else if (maxText) {
          budgetBadge = `<${maxText}tr`;
        } else if (minText) {
          budgetBadge = `>${minText}tr`;
        }
      }

      const pinIcon = createCirclePin(pinColor, budgetBadge);

      const marker = L.marker([adjusted.lat, adjusted.lng], { icon: pinIcon }).addTo(map);

      const roommateAddress = pin.addressRaw
        ? pin.addressRaw
        : formatDesiredWardDisplay(pin.desiredWard, pin.desiredLocationType);

      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
      const popupContent = renderLeafletPopup(roommateAddress);

      marker.bindPopup(popupContent, { closeButton: false, offset: [0, 0] });
      if (!isMobileDevice) {
        marker.on('mouseover', () => {
          try { marker.openPopup(); } catch {}
        });
        marker.on('mouseout', () => {
          try { marker.closePopup(); } catch {}
        });
      }

      marker.on('click', () => {
        try {
          recenterLocationInVisibleMap(map, mapContainerRef.current, [adjusted.lat, adjusted.lng], true);
        } catch {}
        trackMapInteraction({
          tab: 'roommate',
          interaction_type: 'pin_tap',
          target_id: pin.shortId || pin.id || pin.buildingId || undefined,
        });
        if (pin.buildingId && handleBuildingSelection) {
          handleBuildingSelection(pin.buildingId.toLowerCase(), pin.shortId || pin.id);
        } else if (onSelectProfile) {
          onSelectProfile(pin.shortId || pin.id);
        }
      });
      markersRef.current.push(marker);
      if (pin.id) {
        markerMapRef.current.set(pin.id, marker);
        markerMapRef.current.set(pin.id.toLowerCase(), marker);
        markerMapRef.current.set(pin.id.toUpperCase(), marker);
      }
      if (pin.shortId) {
        markerMapRef.current.set(pin.shortId, marker);
        markerMapRef.current.set(pin.shortId.toLowerCase(), marker);
        markerMapRef.current.set(pin.shortId.toUpperCase(), marker);
      }
      if (pin.buildingId) {
        markerMapRef.current.set(pin.buildingId, marker);
        markerMapRef.current.set(pin.buildingId.toLowerCase(), marker);
        markerMapRef.current.set(pin.buildingId.toUpperCase(), marker);
      }
      bounds.extend([adjusted.lat, adjusted.lng]);
    });

    // 3. Render Listing Pins (Color Matrix: Roommate -> Royal Blue #1D4ED8, Pass lại / Tenant -> Theme Primary #B8422E, Owner / Vacancy -> Black #1A1C1E)
    listingPins.forEach((pin) => {
      const targetBuildingId = pin.buildingId || pin.houseId || '';
      let baseCoords: { lat: number; lng: number } | null = null;
      if (pin.lat && pin.lng && pin.lat !== 0 && pin.lng !== 0) {
        baseCoords = { lat: pin.lat, lng: pin.lng };
      } else {
        baseCoords = getWardCoordinatesByCode(targetBuildingId, activeCity) || getWardCoordinates(pin.locationText, activeCity);
      }

      if (!baseCoords || !isWithinCityBounds(baseCoords.lat, baseCoords.lng, activeCity)) return; // Do not plot fake center points or out-of-city points

      const adjusted = getAdjustedCoords(baseCoords.lat, baseCoords.lng);
      if (!isWithinCityBounds(adjusted.lat, adjusted.lng, activeCity)) return;

      const isRoommate = pin.postType === 'roommate' || pin.badgeText === 'Ở ghép' || pin.badgeText === 'Có phòng';
      const isPassRoom = !isRoommate && (
        pin.postType === 'pass_phong' ||
        pin.postType === 'transfer' ||
        pin.authorRole === 'tenant' ||
        pin.sourceType === 'pass_phong' ||
        pin.badgeText === 'Pass phòng' ||
        pin.badgeText === 'Pass lại'
      );
      
      // Color matrix: Roommate -> Royal Blue (#1d4ed8), Pass lại / Tenant -> Theme Accent/Button color (#b8422e), Vacancy -> Black (#1a1c1e)
      const pinColor = isRoommate ? '#1d4ed8' : isPassRoom ? '#b8422e' : '#1a1c1e';

      const pinSymbol = pin.priceDisplay || (isRoommate ? 'Ở ghép' : isPassRoom ? 'P' : '✓');
      const pinIcon = createCirclePin(pinColor, pinSymbol);

      const marker = L.marker([adjusted.lat, adjusted.lng], { icon: pinIcon }).addTo(map);

      const targetPath = (pin.elasticId || targetBuildingId).toLowerCase();
      const addressText = pin.locationText || pin.title || (activeCity === 'SG' ? 'Sài Gòn' : 'Hà Nội');

      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
      const popupContent = renderLeafletPopup(addressText);

      marker.bindPopup(popupContent, { closeButton: false, offset: [0, 0] });
      if (!isMobileDevice) {
        marker.on('mouseover', () => {
          try { marker.openPopup(); } catch {}
        });
        marker.on('mouseout', () => {
          try { marker.closePopup(); } catch {}
        });
      }

      marker.on('click', () => {
        try {
          recenterLocationInVisibleMap(map, mapContainerRef.current, [adjusted.lat, adjusted.lng], true);
        } catch {}
        trackMapInteraction({
          tab: 'listing',
          interaction_type: 'pin_tap',
          target_id: targetPath || pin.id,
        });
        if (handleBuildingSelection) {
          const targetPost = pin.postId || pin.targetPostId || (pin.id !== pin.buildingId ? pin.id : undefined);
          handleBuildingSelection(targetPath, targetPost);
        }
      });
      markersRef.current.push(marker);
      if (pin.id) {
        markerMapRef.current.set(pin.id, marker);
        markerMapRef.current.set(pin.id.toLowerCase(), marker);
        markerMapRef.current.set(pin.id.toUpperCase(), marker);
      }
      if (pin.postId) {
        markerMapRef.current.set(pin.postId, marker);
        markerMapRef.current.set(pin.postId.toLowerCase(), marker);
        markerMapRef.current.set(pin.postId.toUpperCase(), marker);
      }
      if (pin.shortId) {
        markerMapRef.current.set(pin.shortId, marker);
        markerMapRef.current.set(pin.shortId.toLowerCase(), marker);
        markerMapRef.current.set(pin.shortId.toUpperCase(), marker);
      }
      if (pin.targetPostId) {
        markerMapRef.current.set(pin.targetPostId, marker);
        markerMapRef.current.set(pin.targetPostId.toLowerCase(), marker);
        markerMapRef.current.set(pin.targetPostId.toUpperCase(), marker);
      }
      if (pin.houseId) {
        markerMapRef.current.set(pin.houseId, marker);
        markerMapRef.current.set(pin.houseId.toLowerCase(), marker);
        markerMapRef.current.set(pin.houseId.toUpperCase(), marker);
      }
      if (pin.elasticId) {
        markerMapRef.current.set(pin.elasticId, marker);
        markerMapRef.current.set(pin.elasticId.toLowerCase(), marker);
        markerMapRef.current.set(pin.elasticId.toUpperCase(), marker);
      }
      if (pin.buildingId) {
        markerMapRef.current.set(pin.buildingId, marker);
        markerMapRef.current.set(pin.buildingId.toLowerCase(), marker);
        markerMapRef.current.set(pin.buildingId.toUpperCase(), marker);
      }
      bounds.extend([adjusted.lat, adjusted.lng]);
    });

    if (bounds.isValid() && !isPickingLocation && !activeSelectedId && !selectedPoint) {
      latestBoundsRef.current = bounds;
      try {
        const visPadding = getVisibleMapViewportPadding(mapContainerRef.current);
        map.fitBounds(bounds, {
          paddingTopLeft: visPadding.paddingTopLeft,
          paddingBottomRight: visPadding.paddingBottomRight,
          maxZoom: 15,
          animate: false,
        });
      } catch {}
    } else if (!bounds.isValid() && !isPickingLocation && !activeSelectedId && !selectedPoint) {
      latestBoundsRef.current = null;
      const cityCenter = activeCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;
      map.setView([cityCenter.lat, cityCenter.lng], 13, { animate: false });
    }

    const timer = setTimeout(() => {
      const currentMap = mapRef.current;
      if (
        currentMap &&
        (currentMap as any)._loaded &&
        mapContainerRef.current &&
        document.body.contains(mapContainerRef.current)
      ) {
        try {
          currentMap.invalidateSize({ animate: false });
          if (activeSelectedId) {
            const candidateIds = [
              selectedPostId,
              selectedProfileId,
              selectedBuildingId,
              selectedPlaceId,
              activeSelectedId,
            ].filter(Boolean) as string[];

            let targetMarker: L.Marker | undefined;
            for (const cid of candidateIds) {
              const m =
                markerMapRef.current.get(cid) ||
                markerMapRef.current.get(cid.toLowerCase()) ||
                markerMapRef.current.get(cid.toUpperCase());
              if (m) {
                targetMarker = m;
                break;
              }
            }

            if (targetMarker && (targetMarker as any)._map) {
              recenterLocationInVisibleMap(currentMap, mapContainerRef.current, targetMarker.getLatLng(), true);
              setTimeout(() => {
                try {
                  targetMarker?.openPopup();
                } catch {}
              }, 120);
            }
          } else if (!isPickingLocation && !selectedPoint && latestBoundsRef.current && latestBoundsRef.current.isValid()) {
            const visPadding = getVisibleMapViewportPadding(mapContainerRef.current);
            currentMap.fitBounds(latestBoundsRef.current, {
              paddingTopLeft: visPadding.paddingTopLeft,
              paddingBottomRight: visPadding.paddingBottomRight,
              maxZoom: 15,
              animate: false,
            });
          } else if (!isPickingLocation && selectedPoint && !activeSelectedId) {
            recenterLocationInVisibleMap(currentMap, mapContainerRef.current, [selectedPoint.lat, selectedPoint.lng], true);
          } else if (!isPickingLocation && !activeSelectedId && !selectedPoint) {
            const cityCenter = activeCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;
            currentMap.setView([cityCenter.lat, cityCenter.lng], 13, { animate: false });
          }
        } catch {}
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [listingPins, reviewPins, roommatePins, isPickingLocation, selectedPoint?.lat, selectedPoint?.lng, activeSelectedId, activeCity, selectedPostId, selectedProfileId, selectedBuildingId, selectedPlaceId]);

  useEffect(() => {
    if (!hoveredPinId) return;
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobileDevice) return;

    const map = mapRef.current;
    if (!map || !(map as any)._loaded) return;

    const marker =
      markerMapRef.current.get(hoveredPinId) ||
      markerMapRef.current.get(hoveredPinId.toLowerCase()) ||
      markerMapRef.current.get(hoveredPinId.toUpperCase());

    if (marker && (marker as any)._map && marker.getElement()) {
      try {
        marker.openPopup();
      } catch {
        // Prevent openPopup error on unmounted or detached marker
      }
    }
  }, [hoveredPinId]);

  // Intercept clicks on popup links with data-building-id, data-place-id, or data-profile-id
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const profileLink = target.closest('[data-profile-id]') as HTMLElement | null;
      if (profileLink && onSelectProfile) {
        const pid = profileLink.getAttribute('data-profile-id');
        if (pid) {
          e.preventDefault();
          e.stopPropagation();
          onSelectProfile(pid);
          return;
        }
      }

      const buildingLink = (target.closest('[data-building-id]') || target.closest('[data-place-id]')) as HTMLElement | null;
      if (buildingLink && handleBuildingSelection) {
        const bid = buildingLink.getAttribute('data-building-id') || buildingLink.getAttribute('data-place-id');
        if (bid) {
          e.preventDefault();
          e.stopPropagation();
          handleBuildingSelection(bid);
        }
      }
    };

    container.addEventListener('click', handleContainerClick, true);
    return () => {
      container.removeEventListener('click', handleContainerClick, true);
    };
  }, [handleBuildingSelection, onSelectProfile]);

  // Center map on active selected building/profile/post, zoom in, and open Leaflet address popup.
  // When switched between list and map views on mobile, the container may start hidden (width=0). We
  // wait for the list -> map switch (container becomes visible) before
  // recentering and opening the popup, so the selection from any tab + request
  // page shows its address popup on mobile too.
  useEffect(() => {
    if (!activeSelectedId) return;
    const map = mapRef.current;
    if (!map || !(map as any)._loaded) return;

    const container = mapContainerRef.current;
    if (!container) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let prevWidth = 0;
    let prevHeight = 0;

    const findMarker = () => {
      const candidateIds = [
        selectedPostId,
        selectedProfileId,
        selectedBuildingId,
        selectedPlaceId,
        activeSelectedId,
      ].filter(Boolean) as string[];

      for (const cid of candidateIds) {
        const m =
          markerMapRef.current.get(cid) ||
          markerMapRef.current.get(cid.toLowerCase()) ||
          markerMapRef.current.get(cid.toUpperCase());
        if (m) return m;
      }
      return undefined;
    };

    const zoomToActive = () => {
      if (!container || !document.body.contains(container)) return;
      const marker = findMarker();
      if (!marker || !(marker as any)._map) return;
      const currentMap = mapRef.current;
      if (!currentMap || !(currentMap as any)._loaded) return;

      // Recompute internal size after the container becomes visible (mobile view switch)
      try {
        currentMap.invalidateSize({ animate: false });
      } catch {}

      try {
        recenterLocationInVisibleMap(currentMap, container, marker.getLatLng(), true);
      } catch {}

      const popupTimer = setTimeout(() => {
        try {
          const freshMarker = findMarker();
          if (freshMarker && (freshMarker as any)._map) {
            freshMarker.openPopup();
          }
        } catch {}
      }, 120);
      timers.push(popupTimer);
    };

    const checkVisibility = () => {
      const rect = container.getBoundingClientRect();
      const nowVisible = rect.width > 0 && rect.height > 0;
      const becameVisible = nowVisible && (prevWidth === 0 || prevHeight === 0);
      prevWidth = rect.width;
      prevHeight = rect.height;
      if (becameVisible) {
        const t1 = setTimeout(zoomToActive, 80);
        const t2 = setTimeout(zoomToActive, 250);
        timers.push(t1, t2);
      }
    };

    const initialRect = container.getBoundingClientRect();
    prevWidth = initialRect.width;
    prevHeight = initialRect.height;

    if (initialRect.width > 0 && initialRect.height > 0) {
      // Container already visible (desktop, or mobile already on map view)
      const t1 = setTimeout(zoomToActive, 60);
      const t2 = setTimeout(zoomToActive, 220);
      timers.push(t1, t2);
    } else {
      // Hidden (mobile list view): wait for the map view switch
      checkVisibility();
    }

    const observer = new ResizeObserver(() => {
      checkVisibility();
    });
    observer.observe(container);

    const handleWindowResize = () => {
      checkVisibility();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [activeSelectedId, selectedPostId, selectedProfileId, selectedBuildingId, selectedPlaceId, listingPins, reviewPins, roommatePins]);

  // Close the address popup when the selected building/profile is deselected
  useEffect(() => {
    if (activeSelectedId) return;
    const map = mapRef.current;
    if (!map) return;
    try {
      map.closePopup();
    } catch {}
  }, [activeSelectedId]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {/* Map Overlay for Radius Indicator (location pick) or Current Location (address pick) - active only when isPickingLocation */}
      {isPickingLocation && (
        <div className="absolute top-3 right-3 z-[1000] bg-surface/95 backdrop-blur border border-secondary p-2 sm:p-2.5 rounded-md shadow-lg flex flex-col gap-0.5 w-[155px] text-xs font-sans">
          {isPointMode ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="w-full px-2 py-1 bg-neutral border border-secondary rounded text-[11px] font-semibold text-primary hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLocating ? 'Đang tải...' : 'Vị trí hiện tại'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-secondary font-medium">Bán kính:</span>
              <span className="text-sm font-mono font-bold text-tertiary">
                {formatRadius(liveRadiusM)}
              </span>
              <span className="text-[10px] text-secondary leading-tight">
                Thu phóng để đổi bán kính
              </span>
            </div>
          )}
        </div>
      )}


      {/* Center Reticle for Location & Address Picking */}
      {isPickingLocation && (
        <div
          data-testid="map-center-reticle"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] flex flex-col items-center justify-center"
        >
          {isPointMode ? (
            <div className="relative flex items-center justify-center">
              {/* Outer soft ring */}
              <div className="w-6 h-6 rounded-full border-2 border-tertiary bg-tertiary/20 flex items-center justify-center shadow-sm">
                {/* Inner solid red dot */}
                <div className="w-2 h-2 rounded-full bg-tertiary shadow-xs" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Static Radius Circle Overlay */}
              <div
                style={{ width: `${STATIC_SCREEN_RADIUS_PX * 2}px`, height: `${STATIC_SCREEN_RADIUS_PX * 2}px` }}
                className="absolute rounded-full border-2 border-dashed border-tertiary bg-tertiary/15 pointer-events-none shadow-xs"
              />
              {/* Center Reticle Dot */}
              <div className="relative z-10 w-5 h-5 rounded-full border-2 border-tertiary bg-surface flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
              </div>
            </div>
          )}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full border border-secondary rounded-md shadow-sm overflow-hidden z-0"
      />
    </div>
  );
}
