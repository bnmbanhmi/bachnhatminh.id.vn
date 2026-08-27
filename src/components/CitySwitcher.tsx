'use client';

import { Suspense } from 'react';
import { useCityState } from '@/lib/city-state';
import { CityCode } from '@/lib/location';

interface CitySwitcherProps {
  className?: string;
}

function CitySwitcherContent({ className = '' }: CitySwitcherProps) {
  const { activeCity, setCity, isPending } = useCityState();

  const handleSelect = (code: CityCode) => {
    if (code !== activeCity) {
      setCity(code);
    }
  };

  return (
    <div
      role="group"
      aria-label="Chọn khu vực thành phố"
      suppressHydrationWarning
      className={`inline-flex items-center p-0.5 rounded-md bg-neutral/80 border border-secondary/30 text-xs font-semibold select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => handleSelect('HN')}
        disabled={isPending}
        suppressHydrationWarning
        className={`px-2 md:px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
          activeCity === 'HN'
            ? 'bg-primary text-white font-bold shadow-xs'
            : 'text-secondary hover:text-primary hover:bg-neutral'
        }`}
        aria-pressed={activeCity === 'HN'}
        title="Xem phòng trọ và review tại Hà Nội"
      >
        Hà Nội
      </button>

      <button
        type="button"
        onClick={() => handleSelect('SG')}
        disabled={isPending}
        suppressHydrationWarning
        className={`px-2 md:px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
          activeCity === 'SG'
            ? 'bg-primary text-white font-bold shadow-xs'
            : 'text-secondary hover:text-primary hover:bg-neutral'
        }`}
        aria-pressed={activeCity === 'SG'}
        title="Xem phòng trọ và review tại Sài Gòn (TP.HCM)"
      >
        Sài Gòn
      </button>
    </div>
  );
}

export default function CitySwitcher(props: CitySwitcherProps) {
  return (
    <Suspense
      fallback={
        <div className="inline-flex items-center p-0.5 rounded-md bg-neutral/80 border border-secondary/30 text-xs font-semibold select-none h-7 w-28 animate-pulse" />
      }
    >
      <CitySwitcherContent {...props} />
    </Suspense>
  );
}

