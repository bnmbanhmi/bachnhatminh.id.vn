'use client';

import { useState, useRef, useEffect } from 'react';

export const SOURCE_FILTER_OPTIONS = [
  { value: 'direct', label: 'Chính chủ' },
  { value: 'pass', label: 'Pass lại' },
  { value: 'broker', label: 'Sale' },
  { value: 'roommate', label: 'Ở ghép' },
] as const;

export type SourceFilterValue = 'pass' | 'direct' | 'broker' | 'roommate';

export interface SourceFilterDropdownProps {
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}

const ALL_VALUES = SOURCE_FILTER_OPTIONS.map((opt) => opt.value);

export default function SourceFilterDropdown({
  value,
  onChange,
  className = '',
}: SourceFilterDropdownProps) {
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

  // Empty selection is the "Tất cả" state: normalize to the full set.
  const selected = value.length === 0 ? ALL_VALUES : value;
  const allSelected = ALL_VALUES.every((v) => selected.includes(v));
  const displayLabel = allSelected
    ? 'Tất cả'
    : SOURCE_FILTER_OPTIONS.filter((opt) => selected.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

  const toggleSource = (sourceValue: string) => {
    let next: string[];
    if (allSelected) {
      next = ALL_VALUES.filter((v) => v !== sourceValue);
    } else if (selected.includes(sourceValue)) {
      next = selected.filter((v) => v !== sourceValue);
      if (next.length === 0) {
        next = [...ALL_VALUES];
      }
    } else {
      next = [...selected, sourceValue];
    }
    onChange(next);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <label className="inline-flex items-center gap-1.5 cursor-pointer">
        <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
          Nguồn tin:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-7 px-1.5 rounded-sm border border-secondary bg-surface text-primary text-xs font-semibold outline-none cursor-pointer focus:border-tertiary inline-flex items-center gap-1"
        >
          <span className="truncate max-w-[120px]">{displayLabel}</span>
          <svg
            className={`h-3 w-3 shrink-0 stroke-current transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 16 16"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </label>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-1.5 flex flex-col gap-0.5 min-w-[150px]">
          <button
            type="button"
            onClick={() => onChange([...ALL_VALUES])}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
              allSelected
                ? 'bg-primary/10 text-primary font-bold'
                : 'hover:bg-secondary/10 text-primary'
            }`}
          >
            Tất cả
          </button>
          <div className="h-px bg-secondary/20 my-0.5" />
          {SOURCE_FILTER_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleSource(opt.value)}
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