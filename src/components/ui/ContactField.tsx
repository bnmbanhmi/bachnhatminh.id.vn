'use client';

import React, { useEffect, useRef } from 'react';
import { trackFormFieldFriction } from '@/lib/telemetry';

export interface ContactFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showSaveOption?: boolean;
  saveForLater?: boolean;
  onSaveForLaterChange?: (checked: boolean) => void;
  disabled?: boolean;
  formType?: string;
  fieldName?: string;
  error?: string | null;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function ContactField({
  value,
  onChange,
  placeholder = 'Thông tin liên hệ (SĐT/Zalo, Facebook, Instagram)',
  label,
  required = false,
  showSaveOption = false,
  saveForLater = false,
  onSaveForLaterChange,
  disabled = false,
  formType = 'contact_form',
  fieldName = 'contact_info',
  error,
  onFocus,
  onBlur,
}: ContactFieldProps) {
  const lastReportedErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== lastReportedErrorRef.current) {
      lastReportedErrorRef.current = error;
      trackFormFieldFriction({
        form_type: formType,
        action: 'field_error',
        field_name: fieldName,
        error_message: error,
      });
    } else if (!error) {
      lastReportedErrorRef.current = null;
    }
  }, [error, formType, fieldName]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    trackFormFieldFriction({
      form_type: formType,
      action: 'field_focused',
      field_name: fieldName,
    });
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const trimmed = value.trim();
    if (required && !trimmed) {
      const errMsg = 'Thông tin liên hệ là bắt buộc';
      trackFormFieldFriction({
        form_type: formType,
        action: 'field_error',
        field_name: fieldName,
        error_message: errMsg,
      });
    } else if (trimmed.length > 0) {
      trackFormFieldFriction({
        form_type: formType,
        action: 'field_completed',
        field_name: fieldName,
      });
    }
    onBlur?.(e);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-primary mb-1">
          {label}
          {required && ' *'}
        </label>
      )}
      <input
        type="text"
        className="input-field w-full text-xs"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="mt-1 text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      )}
      {showSaveOption && (
        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={saveForLater}
            onChange={(e) => onSaveForLaterChange?.(e.target.checked)}
            className="w-4 h-4 accent-tertiary"
          />
          <span className="text-[10px] text-secondary font-medium">Lưu cho lần sau</span>
        </label>
      )}
    </div>
  );
}
