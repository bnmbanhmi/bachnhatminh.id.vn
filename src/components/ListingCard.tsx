'use client';

import React from 'react';
import BaseCard, { type CardFlag } from '@/components/BaseCard';
import type { ArticleContent } from '@/lib/portfolio-data';

export interface Listing {
  id: string;
  short_id?: string | null;
  title: string;
  price: number;
  date_range?: string | null;
  rating?: number | null;
  description?: string | null;
  content?: string | null;
  media?: string[] | null;
  media_manifest?: unknown;
  building_id?: string | null;
  post_type?: string | null;
  author_role?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  link_text?: string | null;
  reviewer_role?: string | null;
  rough_area?: number | null;
  move_in_date?: string | null;
  contact_info?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  specs?: string[] | null;
  extracted_data?: Record<string, unknown> | null;
  distanceMeters?: number | null;
  buildings?: {
    nmb_id?: string;
    address_text?: string | null;
    street_text?: string | null;
    house_number?: string | null;
    ward_code?: string | null;
    canonical_location?: unknown;
  } | null;
  article?: ArticleContent | null;
}

export interface ListingCardProps {
  listing: Listing;
  variant?: 'card' | 'building';
  href?: string;
  title?: React.ReactNode;
  lineClamp?: number;
  badgeText?: string;
  flag?: CardFlag | string | null;
  flags?: (CardFlag | string)[];
  onSelect?: (buildingId: string, postId?: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export function cleanDescription(desc?: string | null): string {
  if (!desc) return '';
  return desc.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function ListingCard({
  listing,
  href,
  title,
  lineClamp,
  badgeText,
  flag,
  flags,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: ListingCardProps) {
  const postId = listing.short_id || listing.id;
  const cardHref = href || `/?post=${encodeURIComponent(postId)}`;

  const address =
    listing.title ||
    listing.buildings?.address_text ||
    'Item';

  const rawDesc = listing.content || listing.description || null;

  const dateRange =
    listing.published_at ||
    listing.date_range ||
    (typeof listing.extracted_data?.date_range === 'string' ? listing.extracted_data.date_range : null) ||
    listing.created_at;

  const subtitle =
    (typeof listing.extracted_data?.subtitle === 'string' ? listing.extracted_data.subtitle : null) ||
    listing.buildings?.street_text ||
    null;

  const specParts: string[] = [];
  if (Array.isArray(listing.specs) && listing.specs.length > 0) {
    specParts.push(...listing.specs);
  } else if (Array.isArray(listing.extracted_data?.specs) && (listing.extracted_data.specs as string[]).length > 0) {
    specParts.push(...(listing.extracted_data.specs as string[]));
  } else if (subtitle && subtitle !== listing.title) {
    specParts.push(subtitle);
  }

  const normalizedDesc = cleanDescription(rawDesc);

  const cardBodyText = lineClamp === 0
    ? (rawDesc?.trim() || undefined)
    : (normalizedDesc || undefined);

  const footerAction = dateRange ? (
    <span className="text-tertiary font-bold text-xs sm:text-sm font-space-grotesk whitespace-nowrap">
      {dateRange}
    </span>
  ) : undefined;

  const cardFlags: (CardFlag | string)[] = [];
  if (flags && flags.length > 0) {
    cardFlags.push(...flags);
  } else if (flag) {
    cardFlags.push(flag);
  } else if (badgeText) {
    cardFlags.push(badgeText);
  }

  return (
    <BaseCard
      variant="card"
      href={onSelect || onClick ? undefined : cardHref}
      onClick={(e) => {
        if (onSelect) {
          onSelect(listing.id, listing.short_id || listing.id);
        } else if (onClick) {
          onClick(e);
        }
      }}
      flags={cardFlags}
      title={title || address}
      specParts={specParts}
      footerAction={footerAction}
      lineClamp={lineClamp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      {cardBodyText}
    </BaseCard>
  );
}