'use client';

import React from 'react';
import Link from 'next/link';
import BaseCard from '@/components/BaseCard';
import ContactDisclosure from '@/components/ContactDisclosure';
import AdminHideButton from '@/components/admin/AdminHideButton';
import { visibleMediaAssets } from '@/lib/media-assets';
import { trackSocialAction } from '@/lib/telemetry';
import { buildPostShareUrl } from '@/lib/slug';

export interface ReviewData {
  id: string;
  short_id?: string | null;
  title?: string | null;
  rating?: number | null;
  price?: number | null;
  rough_area?: number | null;
  content: string | null;
  reviewer_role?: string | null;
  created_at: string;
  author_name?: string | null;
  address_masked?: string | null;
  building_id?: string | null;
  house_id?: string | null;
  unit_id?: string | null;
  evidence_media?: string[] | null;
  media?: string[] | null;
  media_manifest?: unknown;
  source_type?: string | null;
  source_url?: string | null;
  post_type?: string | null;
  contact_info?: string | null;
  published_at?: string | null;
  extracted_data?: {
    address_raw?: string | null;
    published_at?: string | null;
    rough_area?: number | null;
    area?: number | null;
    price?: number | null;
    contact_info?: string | null;
  } | null;
  units?: {
    rough_area?: number | null;
  } | null;
  buildings?: {
    address_text?: string | null;
  } | null;
  houses?: {
    address_text?: string | null;
  } | null;
  moderation_status?: 'approved' | 'pending' | 'rejected' | string | null;
  distanceMeters?: number | null;
}

export interface ReviewCardProps {
  review: ReviewData;
  /** Search card or full-width place detail presentation */
  variant?: 'card' | 'place';
  /** Optional canonical / building ID for dispute form link */
  canonicalId?: string;
  /** Custom title override (e.g. auth button or contact in detail pane) */
  title?: React.ReactNode;
  /** Whether to display address title as a link to the house/building detail page */
  linkToHouse?: boolean;
  /** Custom href override for house link */
  houseHref?: string;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  /** Line clamp count for content preview (e.g. 3 in search feed) */
  lineClamp?: number;
  /** Whether to show moderation status badge (e.g. in /account profile page) */
  showModerationStatus?: boolean;
  /** Whether to show dispute link in card footer */
  showDisputeLink?: boolean;
  /** Hover callback for map pin sync */
  onMouseEnter?: () => void;
  /** Hover callback for map pin sync */
  onMouseLeave?: () => void;
  /** Optional in-place selection callback */
  onSelect?: (placeId: string, postId?: string) => void;
  /** Click callback override */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export function resolveDisplayDate(
  publishedAt?: string | null,
  createdAt?: string | null
): string | null {
  const raw = publishedAt || createdAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('vi-VN');
}

export function formatRoleText(role?: string | null): string {
  if (!role) return '';
  if (role === 'tenant') return 'Người đang thuê';
  if (role === 'former_tenant') return 'Người thuê cũ';
  if (role === 'roommate_seeker') return 'Người tìm bạn ở ghép';
  return role;
}

export interface SourceAndContactInfo {
  sourceText: string;
  sourceUrl?: string | null;
  isAuthRequired?: boolean;
  contactText?: string | null;
}

export interface FormatSourceAndContactParams {
  postType?: string | null;
  sourceType?: string | null;
  sourceUrl?: string | null;
  authorName?: string | null;
  contactInfo?: string | null;
  isLoggedIn?: boolean;
}

// Resolves the external platform display name from source metadata.
// MUST NOT fall back to authorName — that synthesizes fake contact info.
export function getSourceName(
  sourceType?: string | null,
  sourceUrl?: string | null,
): string {
  const typeStr = (sourceType || '').toLowerCase().trim();
  if (typeStr === 'threads' || typeStr === 'scraped_threads') return 'Threads';
  if (typeStr === 'facebook' || typeStr === 'scraped_facebook') return 'Facebook';
  if (typeStr === 'sheets' || typeStr === 'gsheet' || typeStr === 'imported_sheet' || typeStr === 'curated') return 'Tổng hợp';
  if (typeStr === 'chotot') return 'Chợ Tốt';
  if (typeStr === 'tromoi') return 'Trọ Mới';

  if (sourceUrl && !sourceUrl.includes('nhaminhbach.com')) {
    try {
      const host = new URL(sourceUrl).hostname.replace(/^www\./, '');
      if (host.includes('facebook.com')) return 'Facebook';
      if (host.includes('threads.net')) return 'Threads';
      if (host.includes('chotot.com')) return 'Chợ Tốt';
      if (host.includes('docs.google.com') || host.includes('sheets.google.com') || host.includes('google.com')) return 'Tổng hợp';
      return host;
    } catch {
      // URL parse error — fall through
    }
  }

  return '';
}

// Derives the correct Nguồn / Liên hệ label for a post card footer.
// Rules:
//   External platform (any post_type with external url) → "Nguồn: <platform>"
//   Sheets / Curated sources → "Nguồn: Tổng hợp" (sourceUrl suppressed, non-clickable)
//   Direct user post (roommate, search, listing, review):
//     - Logged in with contact_info: "Liên hệ: <contact_info>"
//     - Anonymous / Unauthenticated: "Đăng nhập để liên hệ" (isAuthRequired: true)
//     - Logged in without contact_info: (empty or "Nguồn: nhaminhbach.com")
//   Named external source type without URL → "Nguồn: <platform>"
//   No source at all (review) → "Nguồn: Tổng hợp"
export function formatSourceAndContact(
  paramsOrPost:
    | FormatSourceAndContactParams
    | {
        post_type?: string | null;
        source_type?: string | null;
        source_url?: string | null;
        contact_info?: string | null;
        author_name?: string | null;
        [key: string]: unknown;
      },
  user?: unknown
): SourceAndContactInfo {
  let postType: string | null = null;
  let sourceType: string | null = null;
  let sourceUrl: string | null = null;
  let contactInfo: string | null = null;
  let isLoggedIn = false;

  if (paramsOrPost && typeof paramsOrPost === 'object') {
    if ('postType' in paramsOrPost || 'contactInfo' in paramsOrPost || 'isLoggedIn' in paramsOrPost) {
      const p = paramsOrPost as FormatSourceAndContactParams;
      postType = p.postType ?? null;
      sourceType = p.sourceType ?? null;
      sourceUrl = p.sourceUrl ?? null;
      contactInfo = p.contactInfo ?? null;
      isLoggedIn = Boolean(p.isLoggedIn || user);
    } else {
      const p = paramsOrPost as Record<string, unknown>;
      postType = (typeof p.post_type === 'string' ? p.post_type : typeof p.postType === 'string' ? p.postType : null);
      sourceType = (typeof p.source_type === 'string' ? p.source_type : typeof p.sourceType === 'string' ? p.sourceType : null);
      sourceUrl = (typeof p.source_url === 'string' ? p.source_url : typeof p.sourceUrl === 'string' ? p.sourceUrl : null);
      contactInfo = (typeof p.contact_info === 'string' ? p.contact_info : typeof p.contactInfo === 'string' ? p.contactInfo : null);
      isLoggedIn = Boolean(user);
    }
  }

  const typeStr = (sourceType || '').toLowerCase().trim();

  const isDirectUser =
    typeStr === 'direct_user' ||
    typeStr === 'user' ||
    typeStr === 'nhaminhbach' ||
    !typeStr;

  const hasExternalSource = Boolean(
    sourceUrl &&
    !sourceUrl.includes('nhaminhbach.com') &&
    (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://'))
  );

  // External platform source always wins — show Liên hệ trực tiếp (<platform>)
  if (hasExternalSource) {
    const name = getSourceName(sourceType, sourceUrl);
    const isSheetsOrAggregate =
      name === 'Tổng hợp' ||
      typeStr === 'sheets' ||
      typeStr === 'gsheet' ||
      typeStr === 'imported_sheet' ||
      typeStr === 'curated' ||
      (sourceUrl ? (sourceUrl.includes('docs.google.com') || sourceUrl.includes('sheets.google.com') || sourceUrl.includes('google.com')) : false);

    if (isSheetsOrAggregate) {
      return { sourceText: 'Nguồn: Tổng hợp', sourceUrl: null };
    }
    const label = name ? `Liên hệ trực tiếp (${name})` : 'Liên hệ trực tiếp';
    return { sourceText: label, sourceUrl };
  }

  const cleanContact = contactInfo ? contactInfo.trim() : '';

  // 2. Named external source type without URL (e.g. source_type = 'curated' / 'threads' but null url)
  if (!isDirectUser) {
    const name = getSourceName(sourceType, sourceUrl);
    return { sourceText: `Nguồn: ${name || 'Tổng hợp'}`, sourceUrl: null };
  }

  // 3. Direct user posts (roommate, search, listing, review) — strictly contact or auth gate
  if (!isLoggedIn) {
    return {
      sourceText: 'Đăng nhập để liên hệ',
      sourceUrl: null,
      contactText: null,
      isAuthRequired: true,
    };
  }

  // Logged in user viewing direct user post
  if (cleanContact) {
    return {
      sourceText: `Liên hệ: ${cleanContact}`,
      sourceUrl: null,
      contactText: cleanContact,
      isAuthRequired: false,
    };
  }

  return {
    sourceText: '',
    sourceUrl: null,
    contactText: null,
    isAuthRequired: false,
  };
}

// Used by ReviewCard for its own title/footer when linkToHouse=false.
// Shows platform name or nhaminhbach.com for direct-user posts.
export function formatSourceTitle(
  sourceType?: string | null,
  sourceUrl?: string | null,
): string {
  const typeStr = (sourceType || '').toLowerCase().trim();
  const isDirectUser = typeStr === 'direct_user' || typeStr === 'user' || typeStr === 'nhaminhbach';

  if (isDirectUser) {
    const hasExternalUrl = Boolean(sourceUrl && !sourceUrl.includes('nhaminhbach.com'));
    return hasExternalUrl ? `Nguồn: ${getSourceName(sourceType, sourceUrl)}` : 'Nguồn: nhaminhbach.com';
  }

  const name = getSourceName(sourceType, sourceUrl);
  return name ? `Nguồn: ${name}` : 'Nguồn: Tổng hợp';
}

export default function ReviewCard({
  review,
  variant = 'card',
  canonicalId,
  title,
  linkToHouse = false,
  houseHref,
  lineClamp,
  showModerationStatus = false,
  showDisputeLink = false,
  isLoggedIn = false,
  onRequireAuth,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  onClick,
  className = '',
}: ReviewCardProps) {
  const rawAddress =
    review.extracted_data?.address_raw ||
    review.buildings?.address_text ||
    review.houses?.address_text ||
    review.address_masked ||
    review.title ||
    review.house_id ||
    review.building_id ||
    'Hà Nội';
  const addressTitle = rawAddress;
  const contentBody = review.content || '';
  const roleText = formatRoleText(review.reviewer_role);
  
  const reviewDate = resolveDisplayDate(
    review.published_at || review.extracted_data?.published_at,
    review.created_at
  );

  const canonicalBuildingId = review.building_id || (review as any).buildings?.nmb_id || review.house_id || null;
  const reviewPostId = review.short_id || review.id;
  const targetBuildingPath = houseHref || (canonicalBuildingId ? `/${canonicalBuildingId}?post=${encodeURIComponent(reviewPostId)}` : `/?tab=review&post=${encodeURIComponent(reviewPostId)}`);
  
  const sourceInfo = formatSourceAndContact({
    postType: review.post_type || 'review',
    sourceType: review.source_type,
    sourceUrl: review.source_url,
    contactInfo: review.contact_info || review.extracted_data?.contact_info,
    isLoggedIn,
  });

  const sourceNameText = formatSourceTitle(review.source_type, review.source_url);

  const cardHref = linkToHouse ? targetBuildingPath : undefined;
  const cardTitle = linkToHouse
    ? addressTitle
    : title || (
        <ContactDisclosure
          info={sourceInfo}
          buildingId={canonicalBuildingId}
          postId={reviewPostId}
          sourceType={review.source_type}
          onRequireAuth={onRequireAuth}
        />
      );

  // Place detail prioritizes property specs before review metadata.
  const specParts: string[] = [];
  const roughArea =
    review.units?.rough_area ||
    review.rough_area ||
    review.extracted_data?.rough_area ||
    review.extracted_data?.area;
  const price = review.price || review.extracted_data?.price;

  if (variant === 'place' && typeof roughArea === 'number' && roughArea > 0) {
    specParts.push(`${roughArea}m²`);
  }
  if (variant === 'place' && typeof price === 'number' && price > 0) {
    const priceInMillions = price / 1000000;
    specParts.push(
      `${priceInMillions.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr/tháng`
    );
  }
  if (variant === 'place' && typeof review.rating === 'number' && review.rating > 0) {
    specParts.push(`${review.rating.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/5`);
  }
  if (roleText) {
    specParts.push(roleText);
  }
  if (review.distanceMeters != null && Number.isFinite(review.distanceMeters)) {
    const dStr =
      review.distanceMeters < 1000
        ? `Cách ${Math.round(review.distanceMeters)}m`
        : `Cách ${(review.distanceMeters / 1000).toFixed(1)}km`;
    specParts.push(dStr);
  }
  if (reviewDate) {
    specParts.push(reviewDate);
  }
  if (linkToHouse && sourceNameText) {
    specParts.push(sourceNameText);
  }

  const reviewMedia = review.evidence_media || review.media || [];
  const reviewAssets = visibleMediaAssets(reviewMedia, review.media_manifest, review.source_type);
  const hasMedia = reviewAssets.length > 0;
  const mainImage = hasMedia ? reviewAssets[0].url : null;
  const extraImagesCount = hasMedia ? reviewAssets.length - 1 : 0;

  const statusBadge = showModerationStatus && review.moderation_status ? (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
        review.moderation_status === 'approved'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-amber-100 text-amber-800'
      }`}
    >
      {review.moderation_status === 'approved' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
    </span>
  ) : undefined;

  return (
    <BaseCard
      variant={variant}
      href={cardHref}
      onClick={(e) => {
        if (onSelect) {
          const resolvedPlaceId = review.building_id || (review as any).buildings?.nmb_id || review.house_id || '';
          onSelect(resolvedPlaceId, review.short_id || review.id);
        } else if (onClick) {
          onClick(e);
        }
      }}
      mediaUrl={variant === 'card' ? mainImage : undefined}
      mediaAssets={reviewAssets}
      mediaUrls={variant === 'place' ? reviewMedia : undefined}
      mediaAlt="Minh chứng review"
      imageBadgeText={extraImagesCount > 0 ? `+${extraImagesCount} ảnh` : undefined}
      imageBadgePosition="bottom-right"
      title={cardTitle}
      statusBadge={statusBadge}
      adminAction={<AdminHideButton postId={review.short_id || review.id} />}
      specParts={specParts}
      lineClamp={lineClamp !== undefined ? lineClamp : 3}
      expandable={variant === 'place'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      {contentBody || 'Không có nội dung chi tiết.'}
    </BaseCard>
  );
}
