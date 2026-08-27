'use client';

import { useState, useRef, useEffect } from 'react';
import { DateFilterOption, DATE_FILTER_OPTIONS } from '@/lib/dates';

interface DateSelectDropdownProps {
  value: DateFilterOption;
  onChange: (val: DateFilterOption) => void;
  className?: string;
  onFocusInput?: () => void;
}

export default function DateSelectDropdown({
  value,
  onChange,
  className = '',
  onFocusInput,
}: DateSelectDropdownProps) {
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

  const selectedOption = DATE_FILTER_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : 'Ngày đăng';

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
          value && value !== 'all'
            ? 'text-primary font-bold border-primary bg-surface'
            : 'text-secondary bg-surface'
        }`}
        aria-label={`Lọc theo ngày đăng: ${displayLabel}`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 stroke-current transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 16 16"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-1.5 flex flex-col gap-0.5 min-w-[140px]">
          {DATE_FILTER_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
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
