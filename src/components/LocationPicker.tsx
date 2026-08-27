'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const LocationRadiusMap = dynamic(() => import('@/components/LocationRadiusMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full bg-neutral flex items-center justify-center text-xs text-secondary">
      Đang tải...
    </div>
  ),
});

export interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface LocationPickerProps {
  value?: LocationPoint | null;
  onChange: (point: LocationPoint | null) => void;
  label?: string;
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  label = 'Chọn vị trí trên bản đồ',
  className = '',
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onChange({
          lat,
          lng,
          label: 'Vị trí GPS hiện tại',
        });
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-primary label-caps">{label}</label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="px-2.5 py-1 bg-neutral border border-secondary rounded text-xs font-bold text-primary hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {locating ? 'Đang tải...' : 'Vị trí hiện tại'}
        </button>
      </div>

      <div className="h-[200px] w-full rounded-sm overflow-hidden border border-secondary relative">
        <LocationRadiusMap
          lat={value?.lat}
          lng={value?.lng}
          radiusM={0}
          onPointChange={(point) => {
            onChange({
              lat: point.lat,
              lng: point.lng,
              label: 'Vị trí ghim trên bản đồ',
            });
          }}
        />
      </div>

      {value?.lat && value?.lng && (
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-emerald-700 font-semibold">
            ✓ Đã ghim vị trí: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-secondary hover:text-error underline text-[10px]"
          >
            Xóa ghim
          </button>
        </div>
      )}
    </div>
  );
}
