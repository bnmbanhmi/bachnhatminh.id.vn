'use client';

import React from 'react';

export interface ZeroStateRecoveryBoxProps {
  variant?: 'feed' | 'map-overlay';
  hasLocationRadius?: boolean;
  hasPriceFilter?: boolean;
  onExpandRadius?: () => void;
  onClearPrice?: () => void;
  onResetAll?: () => void;
  title?: string;
  className?: string;
}

export default function ZeroStateRecoveryBox({
  variant = 'feed',
  hasLocationRadius = false,
  hasPriceFilter = false,
  onExpandRadius,
  onClearPrice,
  onResetAll,
  title,
  className = '',
}: ZeroStateRecoveryBoxProps) {
  const isMapOverlay = variant === 'map-overlay';

  const defaultTitle = isMapOverlay
    ? 'Không có kết quả trong khu vực này'
    : 'Không tìm thấy kết quả phù hợp';

  const displayTitle = title || defaultTitle;

  if (isMapOverlay) {
    return (
      <div
        data-testid="zero-state-map-overlay"
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] max-w-md w-[92%] sm:w-auto bg-surface/95 backdrop-blur border border-secondary p-3 rounded-lg shadow-lg text-center flex flex-col items-center gap-2 pointer-events-auto ${className}`}
      >
        <span className="text-xs font-bold text-primary">{displayTitle}</span>

        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
          {hasLocationRadius && onExpandRadius && (
            <button
              type="button"
              onClick={onExpandRadius}
              className="px-2.5 py-1.5 bg-surface border border-secondary text-primary hover:bg-neutral rounded text-xs font-semibold cursor-pointer transition-colors"
            >
              +1km bán kính
            </button>
          )}

          {hasPriceFilter && onClearPrice && (
            <button
              type="button"
              onClick={onClearPrice}
              className="px-2.5 py-1.5 bg-surface border border-secondary text-primary hover:bg-neutral rounded text-xs font-semibold cursor-pointer transition-colors"
            >
              Xóa bộ lọc giá
            </button>
          )}

          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="px-2.5 py-1.5 bg-primary text-white hover:opacity-90 rounded text-xs font-semibold cursor-pointer transition-opacity"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="zero-state-recovery-box"
      className={`bg-surface border border-secondary rounded-lg p-4 text-center flex flex-col items-center gap-2.5 shadow-xs ${className}`}
    >
      <h4 className="text-xs font-bold text-primary">{displayTitle}</h4>

      <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
        {hasLocationRadius && onExpandRadius && (
          <button
            type="button"
            onClick={onExpandRadius}
            className="px-3 py-1.5 bg-surface border border-secondary text-primary hover:bg-neutral rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            +1km bán kính
          </button>
        )}

        {hasPriceFilter && onClearPrice && (
          <button
            type="button"
            onClick={onClearPrice}
            className="px-3 py-1.5 bg-surface border border-secondary text-primary hover:bg-neutral rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            Xóa bộ lọc giá
          </button>
        )}

        {onResetAll && (
          <button
            type="button"
            onClick={onResetAll}
            className="px-3 py-1.5 bg-primary text-white hover:opacity-90 rounded text-xs font-semibold cursor-pointer transition-opacity"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
