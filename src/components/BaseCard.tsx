'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface CardFlag {
  text: string;
  bgClass?: string;
  textClass?: string;
  className?: string;
}

export interface BaseCardProps {
  variant?: 'card' | 'building' | 'place';
  href?: string;
  flag?: CardFlag | string | null;
  flags?: (CardFlag | string)[];
  title?: React.ReactNode;
  children?: React.ReactNode;
  specParts?: (React.ReactNode | string)[];
  footerAction?: React.ReactNode;
  lineClamp?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export function normalizeCardFlag(flag: CardFlag | string): CardFlag {
  if (typeof flag === 'string') {
    return { text: flag, bgClass: 'bg-primary/95', textClass: 'text-surface' };
  }
  return flag;
}

export default function BaseCard({
  href,
  flag,
  flags,
  title,
  children,
  specParts = [],
  footerAction,
  lineClamp = 2,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className = '',
}: BaseCardProps) {
  const router = useRouter();
  const formattedTitle = title;

  const flagList: CardFlag[] = [];
  if (flag) {
    flagList.push(normalizeCardFlag(flag));
  }
  if (flags && flags.length > 0) {
    flags.forEach((f) => {
      if (f) flagList.push(normalizeCardFlag(f));
    });
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, textarea, select')) {
      return;
    }
    if (onClick) {
      e.preventDefault();
      onClick(e);
      return;
    }
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  const isClickable = Boolean(href || onClick);

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          const target = e.target as HTMLElement;
          if (!target.closest('a, button, input, textarea, select')) {
            if (onClick) {
              e.preventDefault();
              onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
            } else if (href) {
              if (href.startsWith('http://') || href.startsWith('https://')) {
                window.open(href, '_blank', 'noopener,noreferrer');
              } else {
                router.push(href);
              }
            }
          }
        }
      }}
      className={cn(
        'hover:border-primary flex flex-row gap-3 transition-all duration-150 p-3 rounded-xl border border-secondary/40 bg-surface text-left group relative select-none',
        isClickable && 'cursor-pointer',
        className
      )}
    >
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Header Row: Title & Flags */}
          <div className="flex items-center justify-between gap-2 mb-1">
            {formattedTitle && (
              <h2 className="font-bold text-sm sm:text-base tracking-tight text-primary line-clamp-1 min-w-0 flex-1">
                {formattedTitle}
              </h2>
            )}
            {flagList.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {flagList.map((f, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm shadow-xs ${
                      f.className || `${f.bgClass || 'bg-primary/95'} ${f.textClass || 'text-surface'}`
                    }`}
                  >
                    {f.text}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Description Body */}
          {children && (
            <div
              className={`text-xs sm:text-sm text-secondary/85 leading-snug overflow-hidden my-0.5 ${
                lineClamp === 0 || lineClamp >= 100
                  ? 'whitespace-pre-line'
                  : lineClamp === 2
                  ? 'line-clamp-2'
                  : lineClamp === 3
                  ? 'line-clamp-3'
                  : lineClamp === 4
                  ? 'line-clamp-4'
                  : 'line-clamp-2'
              }`}
            >
              {children}
            </div>
          )}
        </div>

        {/* Bottom Row: Specs & Footer Action */}
        {(specParts.length > 0 || footerAction) && (
          <div className="flex items-center justify-between gap-2 mt-auto pt-1.5 flex-wrap">
            {specParts.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-primary flex-wrap min-w-0 flex-1">
                {specParts.filter(Boolean).map((part, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-secondary/40 shrink-0">•</span>}
                    {typeof part === 'string' ? <span>{part}</span> : part}
                  </React.Fragment>
                ))}
              </div>
            )}

            {footerAction && <div className="shrink-0 ml-auto">{footerAction}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
