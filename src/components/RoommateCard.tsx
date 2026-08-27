'use client';

import React from 'react';
import BaseCard, { type CardFlag } from '@/components/BaseCard';
import AdminHideButton from '@/components/admin/AdminHideButton';
import ContactDisclosure from '@/components/ContactDisclosure';
import { formatDisplayDate } from '@/lib/dates';
import { formatDesiredWardDisplay } from '@/lib/location';
import { formatSourceAndContact, formatSourceTitle } from '@/components/ReviewCard';
import { visibleMediaAssets } from '@/lib/media-assets';
import { formatPrice } from '@/components/ListingCard';
import { trackSocialAction } from '@/lib/telemetry';
import { buildPostShareUrl } from '@/lib/slug';

export interface RoommateListing {
  id: string;
  short_id?: string | null;
  avatar_url?: string | null;
  media?: string[] | null;
  media_manifest?: unknown;
  desired_ward?: string | null;
  desired_location_type?: string | null;
  address_raw?: string | null;
  gender_pref?: string | null;
  price?: number | null;
  price_unit?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  contact_info?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  post_type?: string | null;
  bio?: string | null;
  content?: string | null;
  building_id?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  extracted_data?: Record<string, any> | null;
}

export interface RoommateCardProps {
  profile: RoommateListing;
  /** 'card' = search feed; 'building' | 'place' | 'compact' = BuildingDetailPane Ở ghép feed. */
  variant?: 'card' | 'building' | 'place' | 'compact';
  title?: React.ReactNode;
  flag?: CardFlag | string | null;
  flags?: (CardFlag | string)[];
  sourceText?: string | null;
  sourceUrl?: string | null;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  lineClamp?: number;
  onSelect?: (id: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export default function RoommateCard({
  profile,
  variant = 'card',
  title,
  flag,
  flags,
  sourceText,
  sourceUrl,
  isLoggedIn = false,
  onRequireAuth,
  lineClamp,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
}: RoommateCardProps) {
  const isDetailVariant = variant === 'building' || variant === 'place' || variant === 'compact';

  const addressTitle =
    profile.address_raw ||
    formatDesiredWardDisplay(profile.desired_ward, profile.desired_location_type) ||
    'Tìm ở ghép';

  const genderPrefRaw = profile.gender_pref || profile.extracted_data?.gender_preference;
  const genderText =
    genderPrefRaw === 'male'
      ? 'Nam'
      : genderPrefRaw === 'female'
      ? 'Nữ'
      : genderPrefRaw === 'any'
      ? 'Nam/Nữ'
      : null;

  const cardDate = formatDisplayDate(
    profile.published_at || profile.extracted_data?.published_at || profile.created_at
  );

  const priceUnit = (profile as any).extracted_data?.price_unit || profile.price_unit;
  const priceSuffix = priceUnit === 'whole_room' ? '/phòng' : '/người';
  const minBudget = profile.budget_min ?? (profile.extracted_data?.budget_min as number | undefined) ?? 0;
  const maxBudget = profile.budget_max ?? (profile.extracted_data?.budget_max as number | undefined) ?? 0;

  let priceStr: string | null = null;
  if (profile.price && profile.price > 0) {
    priceStr = `${formatPrice(profile.price)}${priceSuffix}`;
  } else if (minBudget > 0 && maxBudget > 0) {
    priceStr =
      minBudget === maxBudget
        ? `${formatPrice(minBudget)}/người`
        : `${formatPrice(minBudget)} - ${formatPrice(maxBudget)}/người`;
  } else if (maxBudget > 0) {
    priceStr = `< ${formatPrice(maxBudget)}/người`;
  } else if (minBudget > 0) {
    priceStr = `> ${formatPrice(minBudget)}/người`;
  }

  const wardSpace = profile.desired_ward
    ? `khu vực ${profile.desired_ward}`
    : profile.address_raw
    ? `tại ${profile.address_raw}`
    : 'Hà Nội';

  const rawContent = profile.content || profile.bio || null;
  const bodyText = rawContent?.trim() || undefined;

  const sourceInfo = formatSourceAndContact({
    postType: profile.post_type || 'roommate',
    sourceType: profile.source_type,
    sourceUrl: profile.source_url || sourceUrl,
    contactInfo: profile.contact_info,
    isLoggedIn,
  });

  const sourceTitle = formatSourceTitle(profile.source_type, profile.source_url || sourceUrl);

  const rawMedia = profile.media || (profile.avatar_url ? [profile.avatar_url] : []);
  const mediaAssets = visibleMediaAssets(rawMedia, profile.media_manifest, profile.source_type);
  const hasMedia = mediaAssets.length > 0;
  const mainImage = hasMedia ? mediaAssets[0].url : null;
  const extraImagesCount = hasMedia ? mediaAssets.length - 1 : 0;

  const cardFlags: (CardFlag | string)[] = [];
  if (flags && flags.length > 0) {
    cardFlags.push(...flags);
  } else if (flag) {
    cardFlags.push(flag);
  } else if (isDetailVariant) {
    cardFlags.push({ text: 'Ở ghép', bgClass: 'bg-blue-700', textClass: 'text-white' });
  } else if (profile.building_id) {
    cardFlags.push({ text: 'Có phòng', bgClass: 'bg-blue-700', textClass: 'text-white' });
  }

  const [linkCopied, setLinkCopied] = React.useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const targetId = profile.short_id || profile.id;
    if (typeof window !== 'undefined' && navigator.clipboard?.writeText && targetId) {
      const shareUrl = buildPostShareUrl(
        targetId,
        profile.content || profile.bio,
        addressTitle,
        'roommate'
      );
      navigator.clipboard.writeText(shareUrl);
      trackSocialAction({
        action_type: 'copy_link',
        target_type: 'post',
        target_id: targetId,
      });
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (isDetailVariant) {
    const detailSpecs: (React.ReactNode | string)[] = [];
    if (priceStr) detailSpecs.push(priceStr);
    if (genderText) detailSpecs.push(genderText);
    if (cardDate) detailSpecs.push(cardDate);

    const cardTitle =
      title || (
        <ContactDisclosure
          info={sourceInfo}
          buildingId={profile.building_id}
          postId={profile.short_id || profile.id}
          sourceType={profile.source_type}
          onRequireAuth={onRequireAuth}
        />
      );

    return (
      <BaseCard
        variant="building"
        mediaUrls={rawMedia}
        mediaAssets={mediaAssets}
        mediaAlt="Ảnh bài đăng ở ghép"
        flags={cardFlags}
        adminAction={<AdminHideButton postId={profile.short_id || profile.id} />}
        title={cardTitle}
        specParts={detailSpecs}
        expandable={true}
        lineClamp={lineClamp !== undefined ? lineClamp : 0}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={className}
      >
        {bodyText}
      </BaseCard>
    );
  }

  // Search Feed Card Variant
  const cardSpecs = [genderText, cardDate, sourceTitle].filter(Boolean) as (React.ReactNode | string)[];
  const footerAction = priceStr ? (
    <span className="text-tertiary font-extrabold text-sm sm:text-base font-space-grotesk whitespace-nowrap">
      {priceStr}
    </span>
  ) : undefined;

  return (
    <BaseCard
      variant="card"
      mediaUrl={mainImage}
      mediaAssets={mediaAssets}
      mediaAlt={addressTitle}
      imageBadgeText={extraImagesCount > 0 ? `+${extraImagesCount} ảnh` : undefined}
      imageBadgePosition="bottom-right"
      flags={cardFlags}
      adminAction={<AdminHideButton postId={profile.short_id || profile.id} />}
      title={title || addressTitle}
      specParts={cardSpecs}
      footerAction={footerAction}
      onClick={(e) => {
        if (onSelect) {
          onSelect(profile.short_id || profile.id);
        } else if (onClick) {
          onClick(e);
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      lineClamp={lineClamp !== undefined ? lineClamp : 2}
      className={className}
    >
      {bodyText}
    </BaseCard>
  );
}