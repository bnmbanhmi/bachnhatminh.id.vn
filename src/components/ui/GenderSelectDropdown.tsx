'use client';

import { useState, useRef, useEffect } from 'react';

export interface GenderOption {
  value: string;
  label: string;
}

interface GenderSelectDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options?: GenderOption[];
  placeholder?: string;
  className?: string;
  onFocusInput?: () => void;
}

const DEFAULT_GENDER_OPTIONS: GenderOption[] = [
  { value: 'any', label: 'Bất kỳ (Nam/Nữ)' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];

export default function GenderSelectDropdown({
  value,
  onChange,
  options = DEFAULT_GENDER_OPTIONS,
  placeholder = 'Giới tính',
  className = '',
  onFocusInput,
}: GenderSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => {
          onFocusInput?.();
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => onFocusInput?.()}
        className={`input-field w-full text-left flex items-center justify-between gap-1 py-2.5 px-3 text-xs md:text-sm transition-colors rounded-md border ${
          value && value !== 'any'
            ? 'text-primary font-bold border-primary bg-surface'
            : 'text-secondary bg-surface'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-1.5 flex flex-col gap-0.5 min-w-[140px]">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'hover:bg-secondary/10 text-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
