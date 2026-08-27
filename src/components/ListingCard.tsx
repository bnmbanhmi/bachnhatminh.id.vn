'use client';

import React from 'react';
import BaseCard, { type CardFlag } from '@/components/BaseCard';
import AdminHideButton from '@/components/admin/AdminHideButton';
import { visibleMediaAssets } from '@/lib/media-assets';
import { formatDisplayDate, formatMoveInDate } from '@/lib/dates';
import { trackSocialAction } from '@/lib/telemetry';
import { buildPostShareUrl } from '@/lib/slug';

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
  extracted_data?: Record<string, any> | null;
  distanceMeters?: number | null;
  buildings?: {
    nmb_id?: string;
    address_text?: string | null;
    street_text?: string | null;
    house_number?: string | null;
    ward_code?: string | null;
    canonical_location?: unknown;
  } | null;
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
  moveInDate?: string | null;
  genderPref?: string | null;
  /** Renders the Cách Xm/km spec — reserved for bounded gợi ý feeds. */
  showDistance?: boolean;
  onSelect?: (buildingId: string, postId?: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    const million = price / 1000000;
    return `${million.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr`;
  }
  return `${(price / 1000).toLocaleString('vi-VN')}k`;
}

export function cleanDescription(desc?: string | null): string {
  if (!desc) return '';
  return desc.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function ListingCard({
  listing,
  variant = 'card',
  href,
  title,
  lineClamp,
  badgeText,
  flag,
  flags,
  moveInDate,
  genderPref,
  showDistance = false,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: ListingCardProps) {
  const buildingId = listing.building_id || listing.buildings?.nmb_id || (listing as any).house_id || '';
  const canonicalId = buildingId ? buildingId.toLowerCase() : '';
  const postId = listing.short_id || listing.id;
  const postParam = postId ? `?post=${encodeURIComponent(postId)}` : '';
  const fallbackHref = canonicalId ? `/${canonicalId}${postParam}` : `/?tab=listing${postParam ? '&' + postParam.slice(1) : ''}`;
  const cardHref = variant === 'building' ? href : (href || fallbackHref);

  const rawAddress =
    listing.buildings?.address_text ||
    listing.buildings?.street_text ||
    (listing as any).address_text ||
    (listing as any).street_text ||
    listing.title ||
    'Hà Nội';

  const address = rawAddress;
  const rawDesc = listing.content || listing.description || null;

  const dateRange =
    listing.date_range ||
    listing.extracted_data?.date_range ||
    listing.published_at ||
    listing.created_at;

  const subtitle =
    listing.extracted_data?.subtitle ||
    listing.buildings?.street_text ||
    null;

  const specParts: string[] = [];
  if (variant === 'building' && listing.price > 0) {
    specParts.push(`${formatPrice(listing.price)}/tháng`);
  }
  if (subtitle && subtitle !== listing.title) {
    specParts.push(subtitle);
  }
  if (showDistance && listing.distanceMeters != null && Number.isFinite(listing.distanceMeters)) {
    const dStr =
      listing.distanceMeters < 1000
        ? `Cách ${Math.round(listing.distanceMeters)}m`
        : `Cách ${(listing.distanceMeters / 1000).toFixed(1)}km`;
    specParts.push(dStr);
  }

  const normalizedDesc = cleanDescription(rawDesc);
  const listingAssets = visibleMediaAssets(listing.media, listing.media_manifest, listing.source_type);

  const cardBodyText = lineClamp === 0
    ? (rawDesc?.trim() || undefined)
    : (normalizedDesc || undefined);

  const postType = listing.post_type || listing.source_type;
  const sourceType = listing.source_type || listing.extracted_data?.source_type;
  const authorRole = listing.author_role || listing.extracted_data?.reviewer_role || listing.reviewer_role;
  const isRoommatePost = postType === 'roommate' || listing.extracted_data?.room_state === 'has_room' || badgeText === 'Ở ghép';
  const priceUnit = listing.extracted_data?.price_unit || (listing as any).price_unit;
  const priceSuffix = isRoommatePost && priceUnit !== 'whole_room' ? '/người' : '';

  const footerAction = listing.price > 0 ? (
    <span className="text-tertiary font-extrabold text-sm sm:text-base font-space-grotesk whitespace-nowrap">
      {formatPrice(listing.price)}{priceSuffix}
    </span>
  ) : dateRange ? (
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
  } else if (isRoommatePost) {
    cardFlags.push({ text: 'Ở ghép', bgClass: 'bg-blue-700', textClass: 'text-white' });
  } else if (authorRole === 'tenant' || postType === 'pass_phong' || postType === 'transfer' || sourceType === 'pass_phong') {
    cardFlags.push({ text: 'Pass lại', bgClass: 'bg-tertiary', textClass: 'text-white' });
  } else if (authorRole === 'broker' || sourceType === 'broker') {
    cardFlags.push({ text: 'Sale', bgClass: 'bg-slate-600', textClass: 'text-white' });
  } else if (postType === 'review') {
    cardFlags.push({ text: 'Đánh giá', bgClass: 'bg-amber-600', textClass: 'text-white' });
  }

  return (
    <BaseCard
      variant={variant === 'building' ? 'building' : 'card'}
      href={onSelect || onClick ? undefined : cardHref}
      onClick={(e) => {
        if (onSelect) {
          onSelect(buildingId || '', listing.short_id || listing.id);
        } else if (onClick) {
          onClick(e);
        }
      }}
      mediaUrl={variant === 'card' ? listing.media?.[0] : undefined}
      mediaUrls={variant === 'building' ? (listing.media || []) : undefined}
      mediaAssets={listingAssets}
      mediaAlt={address}
      flags={cardFlags}
      adminAction={<AdminHideButton postId={listing.short_id || listing.id} />}
      title={title || address}
      specParts={specParts}
      footerAction={footerAction}
      lineClamp={lineClamp}
      expandable={variant === 'building'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      {cardBodyText}
    </BaseCard>
  );
}