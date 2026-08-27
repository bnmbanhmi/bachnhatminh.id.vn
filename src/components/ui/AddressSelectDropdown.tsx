'use client';

import { useState, useRef, useEffect } from 'react';
import { searchHybridLocation, type GeocodeLocationItem } from '@/lib/location';

export interface AddressSelectDropdownProps {
  address: string;
  point: { lat: number; lng: number } | null;
  onChangeAddress: (address: string) => void;
  onChangePoint: (point: { lat: number; lng: number } | null) => void;
  onToggleMapPicker?: () => void;
  isMapPicking?: boolean;
  showMapPickerControls?: boolean;
  onFocusInput?: () => void;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
}

export default function AddressSelectDropdown({
  address,
  point,
  onChangeAddress,
  onChangePoint,
  isMapPicking = false,
  onFocusInput,
  onClose,
  className = '',
  placeholder = 'Địa chỉ',
}: AddressSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeLocationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeAddress('');
    onChangePoint(null);
    setSearchResults([]);
    setIsOpen(false);
    onClose?.();
  };

  const handleSearch = async () => {
    const clean = address.trim();
    if (!clean || clean.length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchHybridLocation(clean);
      setSearchResults(results);
    } catch (err) {
      console.warn('Error searching address in AddressSelectDropdown:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  const handleSelectResult = (item: GeocodeLocationItem) => {
    const selectedAddress =
      item.detail && item.detail !== item.label
        ? `${item.label}, ${item.detail}`
        : item.label;
    onChangeAddress(selectedAddress);
    onChangePoint({ lat: item.lat, lng: item.lng });
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleApplyAddress = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSearchResults([]);
    setIsOpen(false);
    onClose?.();
  };

  const isHighlighted = Boolean(address?.trim() || point);

  const activePlaceholder =
    isOpen || isMapPicking
      ? 'Nhập địa chỉ & Chọn trên bản đồ'
      : address?.trim()
      ? address
      : placeholder;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Main Address Direct Input Box */}
      <div className="relative w-full flex items-center">
        <input
          type="text"
          placeholder={activePlaceholder}
          value={address}
          onChange={(e) => {
            onChangeAddress(e.target.value);
            setSearchResults([]);
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
            isHighlighted
              ? 'text-primary font-bold border-primary'
              : 'text-primary border-secondary focus:border-primary'
          }`}
        />

        <div className="absolute right-1 flex items-center gap-1">
          {(address || point) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-secondary hover:text-primary px-1.5 py-1 cursor-pointer font-normal"
              title="Xóa địa chỉ"
            >
              ✕
            </button>
          )}
          {isOpen && (
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !address?.trim()}
              className="px-2.5 py-1 text-secondary hover:text-primary hover:bg-secondary/10 border border-secondary/30 rounded text-xs font-medium disabled:opacity-40 cursor-pointer whitespace-nowrap transition-colors"
              title="Tìm địa chỉ trên bản đồ"
            >
              {isSearching ? (
                <span className="inline-block animate-spin text-xs">↻</span>
              ) : (
                'Tìm'
              )}
            </button>
          )}
          {(isOpen || isMapPicking) && (
            <button
              type="button"
              onClick={handleApplyAddress}
              className="px-2.5 py-1 bg-primary text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              Xong
            </button>
          )}
        </div>
      </div>

      {/* Expanded Suggestions Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-2 flex flex-col gap-1 min-w-[280px] md:min-w-[340px] max-h-56 overflow-y-auto">
          {searchResults.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1 py-0.5 border-b border-secondary/40">
                <span className="text-[11px] font-semibold text-secondary">
                  Gợi ý vị trí từ bản đồ ({searchResults.length}):
                </span>
              </div>
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left p-1.5 rounded hover:bg-secondary/10 text-xs flex flex-col gap-0.5 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-primary">{item.label}</span>
                  {item.detail && (
                    <span className="text-[11px] text-secondary truncate">{item.detail}</span>
                  )}
                </button>
              ))}
            </>
          )}

          {searchResults.length === 0 && (
            <button
              type="button"
              onClick={handleSearch}
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
