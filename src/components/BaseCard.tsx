'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MediaGallery from '@/components/MediaGallery';
import MediaAssetView from '@/components/MediaAssetView';
import { normalizeMediaAssets, type MediaAsset } from '@/lib/media-assets';

export interface CardFlag {
  text: string;
  /** Custom background color class or hex string (e.g. 'bg-tertiary', 'bg-emerald-700', 'bg-amber-600') */
  bgClass?: string;
  /** Custom text color class (e.g. 'text-white', 'text-surface') */
  textClass?: string;
  /** Custom full className override */
  className?: string;
}

export interface BaseCardProps {
  /** Card layout for search feeds or full-width building detail feeds */
  variant?: 'card' | 'building' | 'place';
  /** Target URL if whole card acts as a link */
  href?: string;
  /** Image URL for left thumbnail container */
  mediaUrl?: string | null;
  /** Alt text for thumbnail image */
  mediaAlt?: string;
  /** Full media collection used by the place detail layout */
  mediaUrls?: string[] | null;
  /** Structured media collection supporting images and videos */
  mediaAssets?: MediaAsset[] | null;
  /** Badge text overlay on thumbnail (e.g. badgeText or +N photos) */
  imageBadgeText?: string | null;
  /** Badge position on image ('top-left' or 'bottom-right') */
  imageBadgePosition?: 'top-left' | 'bottom-right';
  /** Card flag or flags to display in the top-right header row */
  flag?: CardFlag | string | null;
  flags?: (CardFlag | string)[];
  /** Card header title (Standardized to Address across all cards) */
  title?: React.ReactNode;
  /** Status badge shown in header row (e.g. moderation status) */
  statusBadge?: React.ReactNode;
  /** Admin moderation action button (e.g. Quick Hide) */
  adminAction?: React.ReactNode;
  /** Card content body (description or review text) */
  children?: React.ReactNode;
  /** Dot-separated specification items for footer row */
  specParts?: (React.ReactNode | string)[];
  /** Action content on bottom right of footer row (e.g. price or links) */
  footerAction?: React.ReactNode;
  /** Line clamp count for description body text (defaults to 2 for unit cards, flexible for review cards) */
  lineClamp?: number;
  /** Enables an inline Xem thêm/Thu gọn control for long detail content */
  expandable?: boolean;
  /** Mouse hover callback */
  onMouseEnter?: () => void;
  /** Mouse hover callback */
  onMouseLeave?: () => void;
  /** Optional click callback override (e.g. for in-place place selection) */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export function normalizeCardFlag(flag: CardFlag | string): CardFlag {
  if (typeof flag === 'string') {
    const textLower = flag.toLowerCase().trim();
    if (textLower === 'pass lại' || textLower === 'pass phòng') {
      return { text: flag, bgClass: 'bg-tertiary', textClass: 'text-white' };
    }
    if (textLower === 'tìm ở ghép' || textLower === 'ở ghép') {
      return { text: flag, bgClass: 'bg-emerald-700', textClass: 'text-white' };
    }
    if (textLower === 'chính chủ') {
      return { text: flag, bgClass: 'bg-blue-600', textClass: 'text-white' };
    }
    if (textLower === 'sale' || textLower === 'môi giới') {
      return { text: flag, bgClass: 'bg-purple-600', textClass: 'text-white' };
    }
    return { text: flag, bgClass: 'bg-primary/95', textClass: 'text-surface' };
  }
  return flag;
}

function isHiddenCardFlag(flag: CardFlag | string): boolean {
  const text = typeof flag === 'string' ? flag : flag.text;
  const normalized = text.toLowerCase().trim();
  return normalized === 'sale' || normalized === 'môi giới' || normalized === 'chính chủ';
}

export default function BaseCard({
  variant = 'card',
  href,
  mediaUrl,
  mediaAlt = 'Ảnh minh họa',
  mediaUrls,
  mediaAssets,
  imageBadgeText,
  imageBadgePosition = 'top-left',
  flag,
  flags,
  title,
  statusBadge,
  adminAction,
  children,
  specParts = [],
  footerAction,
  lineClamp = 2,
  expandable = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className = '',
}: BaseCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const normalizedMedia = mediaAssets && mediaAssets.length > 0
    ? mediaAssets
    : normalizeMediaAssets(mediaUrls || (mediaUrl ? [mediaUrl] : []));
  const primaryMedia = normalizedMedia[0] || null;
  const hasImage = Boolean(primaryMedia);
  const formattedTitle = title;

  const flagList: CardFlag[] = [];
  if (flag && !isHiddenCardFlag(flag)) {
    flagList.push(normalizeCardFlag(flag));
  }
  if (flags && flags.length > 0) {
    flags.forEach((f) => {
      if (f && !isHiddenCardFlag(f)) flagList.push(normalizeCardFlag(f));
    });
  }
  if (imageBadgeText && imageBadgePosition === 'top-left' && flagList.length === 0) {
    flagList.push(normalizeCardFlag(imageBadgeText));
  }

  const contentIsLong =
    expandable && typeof children === 'string' && children.trim().length > 240;

  if (variant === 'building' || variant === 'place') {
    const detailMedia = normalizedMedia;
    const externalHref = Boolean(href?.startsWith('http://') || href?.startsWith('https://'));

    return (
      <article className={`border-b border-secondary/25 px-4 py-6 text-left md:px-6 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {formattedTitle ? (
              <h2 className="min-w-0 text-base font-bold text-primary sm:text-lg">{formattedTitle}</h2>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {flagList.map((detailFlag, index) => (
              <span
                key={index}
                className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold shadow-xs ${
                  detailFlag.className || `${detailFlag.bgClass || 'bg-primary/95'} ${detailFlag.textClass || 'text-surface'}`
                }`}
              >
                {detailFlag.text}
              </span>
            ))}
            {statusBadge}
            {adminAction}
          </div>
        </div>

        {specParts.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-secondary sm:text-sm">
            {specParts.filter(Boolean).map((part, index) => (
              <React.Fragment key={`${part}-${index}`}>
                {index > 0 && <span aria-hidden="true" className="text-secondary/60">·</span>}
                <span>{part}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {children && (
          <div className="mt-3">
            <div
              className={`whitespace-pre-line text-sm leading-relaxed text-primary sm:text-base ${
                contentIsLong && !isExpanded ? 'line-clamp-4' : ''
              }`}
            >
              {children}
            </div>

            {contentIsLong && (
              <button
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                className="mt-1 cursor-pointer text-sm font-bold text-tertiary hover:underline"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        {detailMedia.length > 0 && (
          <MediaGallery
            assets={detailMedia}
            alt={typeof mediaAlt === 'string' ? mediaAlt : 'Ảnh bài đăng'}
            className="-mx-4 mt-4 w-[calc(100%+2rem)] md:-mx-6 md:w-[calc(100%+3rem)]"
          />
        )}

        {footerAction && <div className="mt-3 flex justify-end">{footerAction}</div>}
      </article>
    );
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
      className={`hover:border-primary flex flex-row gap-3 transition-all duration-150 p-3 rounded-xl border border-secondary/60 bg-surface shadow-xs text-left group relative select-none ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Thumbnail Container (ONLY rendered when an actual image URL exists) */}
      {hasImage && (
        <div className="relative w-28 sm:w-32 h-24 sm:h-28 bg-gray-200 rounded-xl overflow-hidden shrink-0">
          {/* Render Bottom-Right Photo Badge (e.g. +3 ảnh) */}
          {imageBadgeText && imageBadgePosition === 'bottom-right' && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10 shadow-xs bg-black/70 text-white">
              {imageBadgeText}
            </span>
          )}

          <MediaAssetView
            asset={primaryMedia!}
            alt={mediaAlt}
            controls={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {/* Main Content Container (Expands to 100% width when no image) */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Header Row: Standardized Address Title, Status Badge & Overlay */}
          <div className="flex items-center justify-between gap-2 mb-1">
            {formattedTitle && (
              <h2 className="font-bold text-xs sm:text-sm text-primary line-clamp-1 min-w-0 flex-1">
                {formattedTitle}
              </h2>
            )}
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
              {statusBadge}
              {adminAction}
            </div>
          </div>

          {/* Main Description Body (Defaults to strictly 2 lines for unit cards) */}
          {children && (
            <div
              className={`text-xs sm:text-sm text-secondary/90 leading-snug overflow-hidden my-0.5 ${
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
              style={
                lineClamp > 0 && lineClamp <= 4
                  ? undefined
                  : lineClamp > 4 && lineClamp < 100
                  ? {
                      display: '-webkit-box',
                      WebkitLineClamp: lineClamp,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }
                  : undefined
              }
            >
              {children}
            </div>
          )}
        </div>

        {/* Bottom Row: Dedicated Specs Line & Right Action/Price */}
        {(specParts.length > 0 || footerAction) && (
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            {specParts.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-secondary truncate min-w-0 flex-1">
                {specParts.filter(Boolean).map((part, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-secondary/60 shrink-0">•</span>}
                    {typeof part === 'string' ? <span className="truncate">{part}</span> : part}
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
