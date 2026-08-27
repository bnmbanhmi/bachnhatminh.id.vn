'use client';

import { useState, useRef, useEffect } from 'react';

export interface FeedSelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface FeedSelectDropdownProps<T extends string = string> {
  label: string;
  value: T;
  options: FeedSelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  alignMenu?: 'left' | 'right';
}

export default function FeedSelectDropdown<T extends string = string>({
  label,
  value,
  options,
  onChange,
  className = '',
  alignMenu = 'left',
}: FeedSelectDropdownProps<T>) {
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
  const displayLabel = selectedOption ? selectedOption.label : label;

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <label className="inline-flex items-center gap-1.5 cursor-pointer">
        <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
          {label}:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-7 px-1.5 rounded-sm border border-secondary bg-surface text-primary text-xs font-semibold outline-none cursor-pointer focus:border-tertiary inline-flex items-center gap-1"
          aria-label={`${label}: ${displayLabel}`}
        >
          <span className="truncate max-w-[130px]">{displayLabel}</span>
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
        <div
          className={`absolute top-full mt-1 bg-surface border border-secondary rounded-lg shadow-xl z-50 p-1.5 flex flex-col gap-0.5 min-w-[140px] ${
            alignMenu === 'right' ? 'right-0 left-auto' : 'left-0'
          }`}
        >
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