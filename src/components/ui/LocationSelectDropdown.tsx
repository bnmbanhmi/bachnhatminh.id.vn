'use client';

import { useState, useRef, useEffect } from 'react';
import {
  searchHybridLocation,
  type LocationSelection,
  type GeocodeLocationItem,
} from '@/lib/location';

interface LocationSelectDropdownProps {
  value: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  onToggleMapPicker?: () => void;
  isMapPicking?: boolean;
  onFocusInput?: () => void;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
}

export default function LocationSelectDropdown({
  value,
  onChange,
  isMapPicking = false,
  onFocusInput,
  onClose,
  className = '',
  placeholder = 'Khu vực',
}: LocationSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    value?.label && value.label !== 'Khu vực đã chọn' && !value.label.startsWith('Tọa độ')
      ? value.label
      : ''
  );
  const [isSearchingOSM, setIsSearchingOSM] = useState(false);
  const [osmResults, setOsmResults] = useState<GeocodeLocationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSearchQuery('');
    } else if (value.label && value.label !== 'Khu vực đã chọn' && !value.label.startsWith('Tọa độ')) {
      setSearchQuery(value.label);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    onChange(null);
    setOsmResults([]);
    setIsOpen(false);
    onClose?.();
  };

  const handleSearchOSM = async () => {
    const clean = searchQuery.trim();
    if (!clean || clean.length < 2) return;
    setIsSearchingOSM(true);
    try {
      const results = await searchHybridLocation(clean);
      setOsmResults(results);
    } catch (err) {
      console.warn('Error fetching OSM results in LocationSelectDropdown:', err);
    } finally {
      setIsSearchingOSM(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearchOSM();
    }
  };

  const handleSelectGeocodeResult = (item: GeocodeLocationItem) => {
    onChange({
      type: 'radius',
      lat: item.lat,
      lng: item.lng,
      radiusM: 1000,
      label: item.label,
      wardCode: item.wardCode,
    });
    setSearchQuery(item.label);
    setOsmResults([]);
    setIsOpen(false);
  };

  const getDisplayLabel = (): string => {
    if (!value) return placeholder;
    if (value.type === 'ward') return value.label;
    if (value.label.startsWith('Tọa độ')) return 'Khu vực đã chọn';
    return value.label;
  };

  const isHighlighted = Boolean(value);

  const activePlaceholder =
    isOpen || isMapPicking
      ? value && value.label !== 'Khu vực đã chọn' && !value.label.startsWith('Tọa độ')
        ? value.label
        : 'Tìm khu vực/Chọn trên bản đồ'
      : value
      ? getDisplayLabel()
      : placeholder;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Main Location Direct Input Box */}
      <div className="relative w-full flex items-center">
        <input
          type="text"
          placeholder={activePlaceholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOsmResults([]);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            onFocusInput?.();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full py-2.5 pl-3 ${
            isOpen || isMapPicking ? (isOpen ? 'pr-32' : 'pr-20') : 'pr-10'
          } text-xs md:text-sm bg-surface border rounded-md focus:outline-none transition-colors ${
            isHighlighted && !searchQuery
              ? 'text-primary font-bold border-primary'
              : 'text-primary border-secondary focus:border-primary'
          }`}
        />
        <div className="absolute right-1 flex items-center gap-1">
          {(searchQuery || value) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-secondary hover:text-primary px-1.5 py-1 cursor-pointer font-normal"
              title="Xóa khu vực"
            >
              ✕
            </button>
          )}
          {isOpen && (
            <button
              type="button"
              onClick={handleSearchOSM}
              disabled={isSearchingOSM || !searchQuery.trim()}
              className="px-2.5 py-1 text-secondary hover:text-primary hover:bg-secondary/10 border border-secondary/30 rounded text-xs font-medium disabled:opacity-40 cursor-pointer whitespace-nowrap transition-colors"
              title="Tìm khu vực trên bản đồ"
            >
              {isSearchingOSM ? (
                <span className="inline-block animate-spin text-xs">↻</span>
              ) : (
                'Tìm'
              )}
            </button>
          )}
          {(isOpen || isMapPicking) && (
            <button
              type="button"
              onClick={() => {
                setOsmResults([]);
                setIsOpen(false);
                onClose?.();
              }}
              className="px-2.5 py-1 bg-primary text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              Xong
            </button>
          )}
        </div>
      </div>

      {/* Expanded Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-2.5 flex flex-col gap-2 min-w-[280px] md:min-w-[340px] max-h-64 overflow-y-auto">
          {/* OSM / Landmark Hybrid Results */}
          {osmResults.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] font-semibold text-secondary px-1 mb-0.5">
                Địa điểm gợi ý ({osmResults.length}):
              </div>
              {osmResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectGeocodeResult(item)}
                  className="w-full text-left p-1.5 rounded hover:bg-secondary/10 text-xs flex flex-col gap-0.5 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-primary">{item.label}</span>
                  {item.detail && (
                    <span className="text-[10px] text-secondary truncate">{item.detail}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {osmResults.length === 0 && (
            <button
              type="button"
              onClick={handleSearchOSM}
              className="w-full text-xs text-secondary hover:text-primary hover:bg-secondary/10 px-2 py-2 text-center rounded transition-colors cursor-pointer font-medium"
            >
              Nhấn nút Tìm hoặc Enter để tìm kiếm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
