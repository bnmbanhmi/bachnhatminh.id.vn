'use client';

import { useState, useRef, useEffect } from 'react';

export interface PostTypeOption {
  value: string;
  label: string;
}

interface PostTypeSelectDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options?: PostTypeOption[];
  placeholder?: string;
  className?: string;
  onFocusInput?: () => void;
}

export const DEFAULT_POST_TYPE_OPTIONS: PostTypeOption[] = [
  { value: 'all', label: 'Tất cả nguồn tin' },
  { value: 'direct', label: 'Chính chủ' },
  { value: 'pass', label: 'Pass lại' },
  { value: 'broker', label: 'Sale' },
  { value: 'roommate', label: 'Ở ghép' },
];

export const POST_SOURCE_OPTIONS: PostTypeOption[] = [
  { value: 'direct', label: 'Chính chủ' },
  { value: 'pass', label: 'Pass lại' },
  { value: 'broker', label: 'Sale' },
  { value: 'roommate', label: 'Tìm ở ghép' },
];

export default function PostTypeSelectDropdown({
  value,
  onChange,
  options = DEFAULT_POST_TYPE_OPTIONS,
  placeholder = 'Nguồn tin',
  className = '',
  onFocusInput,
}: PostTypeSelectDropdownProps) {
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
          value && value !== 'all'
            ? 'text-primary font-bold border-primary bg-surface'
            : 'text-secondary bg-surface'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-1.5 flex flex-col gap-0.5 min-w-[150px]">
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
