'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import ContactDisclosure from '@/components/ContactDisclosure';
import AdminHideButton from '@/components/admin/AdminHideButton';
import { formatSourceAndContact } from '@/components/ReviewCard';
import SegmentedControl from '@/components/ui/SegmentedControl';
import MediaGallery from '@/components/MediaGallery';
import { visibleMediaAssets } from '@/lib/media-assets';
import { formatDesiredWardDisplay } from '@/lib/location';
import { pushHomeSearchParams } from '@/lib/home-url-state';
import { trackBuildingInspect, trackCardDwellTime, trackFormStep, trackSocialAction } from '@/lib/telemetry';
import { getFavorites, toggleFavorite } from '@/lib/storage';
import { buildPostShareUrl } from '@/lib/slug';
import { PORTFOLIO_LISTINGS } from '@/lib/portfolio-data';

export interface PostDetailPaneProps {
  elasticId?: string;
  postId?: string;
  profileId?: string;
  onClose?: () => void;
  onRequestWriteReview?: (buildingId: string) => void;
  onRequireAuth?: () => void;
  isMobile?: boolean;
  className?: string;
  initialTab?: 'all' | 'listings' | 'reviews' | 'roommates';
  highlightReviewId?: string;
  highlightPostId?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface ListingRecord {
  id: string;
  short_id?: string | null;
  title?: string | null;
  price?: number | null;
  verification_tier?: number;
  media?: string[] | null;
  media_manifest?: unknown;
  description?: string | null;
  content?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  post_type?: string | null;
  author_role?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  building_id?: string | null;
  rough_area?: number | null;
  contact_info?: string | null;
  extracted_data?: Record<string, unknown> | null;
  move_in_date?: string | null;
  gender_pref?: string | null;
}

export interface ReviewRecord {
  id: string;
  short_id?: string | null;
  building_id?: string | null;
  rating?: number | null;
  content?: string | null;
  reviewer_role?: string | null;
  evidence_media?: string[] | null;
  media?: string[] | null;
  media_manifest?: unknown;
  source_type?: string | null;
  source_url?: string | null;
  contact_info?: string | null;
  created_at: string;
  published_at?: string | null;
  extracted_data?: Record<string, unknown> | null;
}

export interface RoommateRecord {
  id: string;
  short_id?: string | null;
  building_id?: string | null;
  content?: string | null;
  bio?: string | null;
  price?: number | null;
  price_unit?: string | null;
  media?: string[] | null;
  media_manifest?: unknown;
  contact_info?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  post_type?: string | null;
  gender_pref?: string | null;
  desired_ward?: string | null;
  desired_location_type?: string | null;
  address_raw?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  rough_area?: number | null;
  move_in_date?: string | null;
  extracted_data?: {
    desired_ward?: string | null;
    desired_location_type?: string | null;
    address_raw?: string | null;
    gender_preference?: string | null;
    price_unit?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    room_state?: string | null;
    contact_info?: string | null;
    move_in_date?: string | null;
    rough_area?: number | null;
    area?: number | null;
    price?: number | null;
    bio?: string | null;
    content?: string | null;
  } | null;
  published_at?: string | null;
  created_at?: string | null;
}

export type Profile = RoommateRecord;

function formatVND(value: number | null | undefined): string {
  if (!value || value <= 0) return 'Thỏa thuận';
  if (value >= 1000000) {
    const valInMillions = value / 1000000;
    return `${valInMillions % 1 === 0 ? valInMillions : valInMillions.toFixed(1).replace('.', ',')} tr`;
  }
  return `${value.toLocaleString('vi-VN')} đ`;
}

function formatDDMM(dateStr?: string | null | number): string | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str) return null;

  // DD/MM (already formatted)
  if (/^\d{1,2}\/\d{1,2}$/.test(str)) {
    const [d, m] = str.split('/');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const [, d, m] = dmyMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (ymdMatch) {
    const [, , m, d] = ymdMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}`;
  }

  // Date parsing fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}`;
  }

  return str;
}

interface StandardPostData {
  id: string;
  shortId?: string | null;
  buildingId?: string | null;
  postType: string;
  sourceType?: string | null;
  sourceUrl?: string | null;
  contactInfo?: string | null;
  rating?: number | null;
  price?: number | null;
  priceUnit?: string | null;
  utilityDetailsRaw?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  area?: number | null;
  genderPref?: string | null;
  moveInDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  content?: string | null;
  media?: string[] | null;
  evidenceMedia?: string[] | null;
  mediaManifest?: unknown;
}

function getListingStandardData(l: ListingRecord): StandardPostData {
  const ext = (l.extracted_data || {}) as Record<string, unknown>;
  return {
    id: l.id,
    shortId: l.short_id,
    buildingId: l.building_id,
    postType: l.post_type || 'listing',
    sourceType: l.source_type,
    sourceUrl: l.source_url,
    contactInfo: l.contact_info || (ext.contact_info as string) || null,
    price: l.price ?? (ext.price as number) ?? null,
    priceUnit: (ext.price_unit as string) || null,
    utilityDetailsRaw: (ext.utility_details_raw as string) || null,
    area: l.rough_area ?? (ext.rough_area as number) ?? (ext.area as number) ?? null,
    genderPref: l.gender_pref ?? (ext.gender_preference as string) ?? null,
    moveInDate: l.move_in_date ?? (ext.move_in_date as string) ?? null,
    publishedAt: l.published_at,
    createdAt: l.created_at,
    content: l.content || l.description || null,
    media: l.media,
    mediaManifest: l.media_manifest,
  };
}

function getReviewStandardData(r: ReviewRecord): StandardPostData {
  const ext = (r.extracted_data || {}) as Record<string, unknown>;
  return {
    id: r.id,
    shortId: r.short_id,
    buildingId: r.building_id,
    postType: 'review',
    sourceType: r.source_type,
    sourceUrl: r.source_url,
    contactInfo: r.contact_info || (ext.contact_info as string) || null,
    rating: r.rating ?? (ext.rating as number) ?? null,
    price: (ext.price as number) ?? null,
    priceUnit: (ext.price_unit as string) || null,
    utilityDetailsRaw: (ext.utility_details_raw as string) || null,
    area: (ext.rough_area as number) ?? (ext.area as number) ?? null,
    genderPref: (ext.gender_preference as string) ?? null,
    moveInDate: (ext.move_in_date as string) ?? null,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    content: r.content || null,
    media: r.media,
    evidenceMedia: r.evidence_media,
    mediaManifest: r.media_manifest,
  };
}

function getRoommateStandardData(rm: RoommateRecord): StandardPostData {
  const ext = (rm.extracted_data || {}) as Record<string, any>;
  const addressRaw = ext.address_raw || rm.address_raw || null;
  const desiredWard = ext.desired_ward || rm.desired_ward || null;
  const priceUnit = ext.price_unit || rm.price_unit || null;
  const price = rm.price ?? (typeof ext.price === 'number' ? ext.price : null);
  const budgetMin =
    ext.budget_min !== undefined && ext.budget_min !== null
      ? Number(ext.budget_min)
      : rm.budget_min !== undefined && rm.budget_min !== null
      ? Number(rm.budget_min)
      : null;
  const budgetMax =
    ext.budget_max !== undefined && ext.budget_max !== null
      ? Number(ext.budget_max)
      : rm.budget_max !== undefined && rm.budget_max !== null
      ? Number(rm.budget_max)
      : null;
  const genderPref = ext.gender_preference || rm.gender_pref || null;
  const moveInDate = ext.move_in_date || rm.move_in_date || null;
  const content =
    rm.content ||
    rm.bio ||
    (ext.content as string) ||
    (ext.bio as string) ||
    (ext.description as string) ||
    null;
  const area = rm.rough_area ?? (ext.rough_area as number) ?? (ext.area as number) ?? null;

  return {
    id: rm.id,
    shortId: rm.short_id,
    buildingId: rm.building_id,
    postType: rm.post_type || 'roommate',
    sourceType: rm.source_type,
    sourceUrl: rm.source_url,
    contactInfo: rm.contact_info || ext.contact_info || null,
    price,
    priceUnit,
    utilityDetailsRaw: (ext.utility_details_raw as string) || null,
    budgetMin,
    budgetMax,
    area,
    genderPref,
    moveInDate,
    publishedAt: rm.published_at || rm.created_at,
    createdAt: rm.created_at,
    content,
    media: rm.media,
    mediaManifest: rm.media_manifest,
  };
}

function StandardPostCard({
  post,
  isLoggedIn,
  onRequireAuth,
  onConvertedOutbound,
  isHighlighted = false,
}: {
  post: StandardPostData;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  onConvertedOutbound?: () => void;
  isHighlighted?: boolean;
}) {
  const isRoommate = post.postType === 'roommate';
  const isReview = post.postType === 'review';

  // 1. Nguồn / Liên hệ
  const contactData = formatSourceAndContact({
    postType: post.postType,
    sourceType: post.sourceType,
    sourceUrl: post.sourceUrl,
    contactInfo: post.contactInfo,
    isLoggedIn,
  });

  // 2. Specs Row: Giá thuê/Ngân sách + Giới tính + Diện tích + Vào ở/Ngày đăng
  const priceVal = post.price && post.price > 0 ? post.price : null;
  const minB = post.budgetMin ?? 0;
  const maxB = post.budgetMax ?? 0;
  let priceStr: string | null = null;
  if (priceVal !== null) {
    priceStr = `${formatVND(priceVal)}${isRoommate ? (post.priceUnit === 'whole_room' ? '/phòng' : '/người') : '/tháng'}`;
  } else if (isRoommate && minB > 0 && maxB > 0) {
    priceStr = minB === maxB ? `${formatVND(maxB)}/người` : `${formatVND(minB)} - ${formatVND(maxB)}/người`;
  } else if (isRoommate && maxB > 0) {
    priceStr = `< ${formatVND(maxB)}/người`;
  } else if (isRoommate && minB > 0) {
    priceStr = `> ${formatVND(minB)}/người`;
  }

  const genderPrefLower = (post.genderPref || '').toLowerCase();
  const genderText =
    genderPrefLower === 'male' || genderPrefLower === 'nam'
      ? 'Nam'
      : genderPrefLower === 'female' || genderPrefLower === 'nữ' || genderPrefLower === 'nu'
      ? 'Nữ'
      : genderPrefLower === 'any' || genderPrefLower === 'both' || genderPrefLower === 'nam/nữ'
      ? 'Nam/Nữ'
      : post.genderPref || null;

  const areaVal = post.area && post.area > 0 ? post.area : null;
  const displayDate = formatDDMM(post.publishedAt || post.createdAt);
  const formattedMoveIn = formatDDMM(post.moveInDate);
  const dateSpec = formattedMoveIn
    ? `Vào ở: ${formattedMoveIn}`
    : displayDate
    ? displayDate
    : null;

  // 4. Media
  const postMedia = useMemo(() => {
    const raw = post.evidenceMedia || post.media;
    return visibleMediaAssets(raw, post.mediaManifest, post.sourceType);
  }, [post.evidenceMedia, post.media, post.mediaManifest, post.sourceType]);

  return (
    <article
      id={`post-item-${(post.shortId || post.id).toLowerCase()}`}
      data-post-id={post.id.toLowerCase()}
      data-short-id={post.shortId ? post.shortId.toLowerCase() : undefined}
      className={`flex flex-col gap-2.5 py-3.5 px-4 border-b border-secondary/20 transition-colors ${
        isHighlighted ? 'bg-primary/5 ring-1 ring-tertiary/40 rounded-sm' : ''
      }`}
    >
      {/* Line 1: Nguồn / Liên hệ */}
      <div className="w-full flex items-center justify-between gap-2">
        <ContactDisclosure
          info={contactData}
          buildingId={post.buildingId || undefined}
          postId={post.shortId || post.id}
          sourceType={post.sourceType}
          onRequireAuth={onRequireAuth}
          onConvertedOutbound={onConvertedOutbound}
        />
        <AdminHideButton postId={post.shortId || post.id} />
      </div>

      {/* Line 2: Giá thuê/Ngân sách + Giới tính + Diện tích + Vào ở/Ngày đăng */}
      {(priceStr || genderText || areaVal || dateSpec || (isReview && post.rating)) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-sans text-primary">
          {priceStr && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary">
                {isRoommate ? 'Ngân sách:' : 'Giá thuê:'}
              </span>
              <span className="font-bold text-tertiary">{priceStr}</span>
            </div>
          )}

          {isReview && post.rating && post.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary">Đánh giá:</span>
              <div className="flex items-center text-amber-500 gap-0.5" title={`${post.rating}/5 sao`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4"
                    fill={star <= Math.round(post.rating!) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.116.488-.415.87-.837.614l-4.742-2.884a.563.563 0 00-.576 0l-4.742 2.884c-.422.256-.953-.126-.837-.614l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                ))}
              </div>
            </div>
          )}

          {genderText && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary">Giới tính:</span>
              <span className="font-medium text-primary">{genderText}</span>
            </div>
          )}

          {areaVal && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary">Diện tích:</span>
              <span className="font-medium text-primary">{areaVal} m²</span>
            </div>
          )}

          {/* HIDE FOR NOW: Điện nước / Dịch vụ commented out
          {post.utilityDetailsRaw && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-secondary">Điện nước/Dịch vụ:</span>
              <span className="font-medium text-primary bg-secondary/10 px-1.5 py-0.5 rounded text-xs">
                {post.utilityDetailsRaw}
              </span>
            </div>
          )}
          */}

          {dateSpec && (
            <div className="flex items-center gap-1 text-secondary ml-auto text-xs sm:text-sm">
              <span>{dateSpec}</span>
            </div>
          )}
        </div>
      )}

      {/* Line 3: Mô tả (Clean full un-clamped text, no title heading) */}
      {post.content && post.content.trim().length > 0 && (
        <div className="text-primary text-xs whitespace-pre-line leading-relaxed">
          {post.content.trim()}
        </div>
      )}

      {/* Line 4: Media */}
      {postMedia.length > 0 && (
        <MediaGallery
          assets={postMedia}
          alt="Ảnh bài đăng"
          variant="hero"
          className="mt-1"
        />
      )}
    </article>
  );
}

export default function PostDetailPane({
  elasticId,
  postId,
  profileId,
  onClose,
  onRequestWriteReview,
  onRequireAuth,
  className = '',
  initialTab = 'listings',
  highlightReviewId,
  highlightPostId,
  dragHandleProps,
}: PostDetailPaneProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Address & building metadata
  const [addressTitle, setAddressTitle] = useState<string | null>(null);
  const [resolvedBuildingId, setResolvedBuildingId] = useState<string | null>(null);

  // Post collections
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [roommates, setRoommates] = useState<RoommateRecord[]>([]);

  // Standalone unanchored roommate profile
  const [standaloneProfile, setStandaloneProfile] = useState<RoommateRecord | null>(null);

  // SubTab manual selection
  const [userSubTab, setUserSubTab] = useState<'listings' | 'reviews' | 'roommates' | null>(null);

  // Social action copy state
  const [linkCopied, setLinkCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  // Dwell time & inspection depth refs
  const startTimeRef = useRef<number>(0);
  const reachedBottomRef = useRef<boolean>(false);
  const convertedOutboundRef = useRef<boolean>(false);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const paneRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const targetIdentifier = (postId || highlightPostId || highlightReviewId || profileId || '').toLowerCase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id, email: user.email });
      } else {
        setUser(null);
      }
    });
  }, [supabase]);

  // Load Unanchored Roommate Seeker Profile
  const loadStandaloneProfile = useCallback(async (profId: string) => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profId);
      let query = supabase.from('posts_public').select(`
        id,
        short_id,
        content,
        price,
        media,
        media_manifest,
        rating,
        published_at,
        created_at,
        post_type,
        author_role,
        source_type,
        source_url,
        contact_info,
        extracted_data,
        building_id
      `);
      if (isUuid) {
        query = query.or(`short_id.eq.${profId},id.eq.${profId}`);
      } else {
        query = query.eq('short_id', profId);
      }
      let postResult: any = null;
      const { data: pData } = await query.maybeSingle();
      postResult = pData;

      if (!postResult) {
        let rmQuery = supabase.from('roommate_posts_public').select('*');
        if (isUuid) {
          rmQuery = rmQuery.or(`short_id.eq.${profId},id.eq.${profId}`);
        } else {
          rmQuery = rmQuery.eq('short_id', profId);
        }
        const { data: rmData } = await rmQuery.maybeSingle();
        postResult = rmData;
      }

      if (postResult) {
        const item = postResult as RoommateRecord;
        setStandaloneProfile(item);
        const desiredWard = item.extracted_data?.desired_ward || item.desired_ward;
        const locType = item.extracted_data?.desired_location_type || item.desired_location_type;
        const addressRaw = item.extracted_data?.address_raw || item.address_raw;
        const addr = addressRaw || (desiredWard ? formatDesiredWardDisplay(desiredWard, locType) : 'Tìm ở ghép');
        setAddressTitle(addr);
      } else {
        setStandaloneProfile(null);
      }
    } catch (err) {
      console.error('Error loading standalone roommate profile:', err);
      setStandaloneProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load Building and associated posts
  const loadBuildingData = useCallback(async (targetId: string) => {
    try {
      const idStr = String(targetId).trim();
      const portfolioMatch = PORTFOLIO_LISTINGS.find(
        (p) => p.id.toLowerCase() === idStr.toLowerCase() || p.short_id?.toLowerCase() === idStr.toLowerCase()
      );
      if (portfolioMatch) {
        setAddressTitle(portfolioMatch.title);
        setListings([portfolioMatch as any]);
        setReviews([]);
        setRoommates([]);
        setLoading(false);
        return;
      }

      const upperId = idStr.toUpperCase();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(idStr);

      let canonicalNmbId: string | null = null;
      let addrText: string | null = null;

      // 1. Check if targetId is an NMB_ID on buildings table
      const { data: bInfo } = await supabase
        .from('buildings')
        .select('nmb_id, address_text, street_text, house_number, ward_code, canonical_location')
        .eq('nmb_id', upperId)
        .maybeSingle();

      if (bInfo) {
        canonicalNmbId = bInfo.nmb_id;
        addrText =
          bInfo.address_text ||
          (bInfo.street_text ? `${bInfo.house_number ? bInfo.house_number + ' ' : ''}${bInfo.street_text}` : null);
      }

      // 2. If not found as building, check if targetId or postId matches a post
      if (!canonicalNmbId) {
        const queryPostId = postId || idStr;
        const queryPostUpper = queryPostId.toUpperCase();
        const queryPostIsUuid = uuidRegex.test(queryPostId);

        const { data: singlePost } = await supabase
          .from('posts_public')
          .select('id, short_id, building_id, extracted_data')
          .or(`short_id.eq.${queryPostId},short_id.eq.${queryPostUpper}${queryPostIsUuid ? `,id.eq.${queryPostId}` : isUuid ? `,id.eq.${idStr}` : ''}`)
          .maybeSingle();

        if (singlePost) {
          const sPost = singlePost as { building_id?: string | null; extracted_data?: { address_raw?: string; desired_ward?: string; desired_location_type?: string } | null };
          if (sPost.building_id) {
            canonicalNmbId = sPost.building_id;
            const { data: bData } = await supabase
              .from('buildings')
              .select('nmb_id, address_text, street_text, house_number')
              .eq('nmb_id', sPost.building_id)
              .maybeSingle();
            if (bData) {
              addrText =
                bData.address_text ||
                (bData.street_text ? `${bData.house_number ? bData.house_number + ' ' : ''}${bData.street_text}` : null);
            }
          } else {
            const ext = sPost.extracted_data;
            const desiredWard = ext?.desired_ward;
            const locType = ext?.desired_location_type;
            const addressRaw = ext?.address_raw;
            addrText = addressRaw || (desiredWard ? formatDesiredWardDisplay(desiredWard, locType) : 'Chi tiết bài đăng');
          }
        }
      }

      const activeNmbId = canonicalNmbId || null;
      setResolvedBuildingId(activeNmbId);
      setAddressTitle(addrText || (canonicalNmbId ? `Địa chỉ ${canonicalNmbId}` : 'Chi tiết bài đăng'));

      // 3. Fetch all posts attached to this building or matching ID
      let postsQuery = supabase.from('posts_public').select(`
        id,
        short_id,
        content,
        price,
        media,
        media_manifest,
        rating,
        published_at,
        created_at,
        post_type,
        author_role,
        source_type,
        source_url,
        contact_info,
        extracted_data,
        building_id
      `);

      if (canonicalNmbId) {
        postsQuery = postsQuery.eq('building_id', canonicalNmbId);
      } else {
        const queryPostId = postId || idStr;
        const queryPostUpper = queryPostId.toUpperCase();
        const queryPostIsUuid = uuidRegex.test(queryPostId);
        postsQuery = postsQuery.or(`short_id.eq.${queryPostId},short_id.eq.${queryPostUpper}${queryPostIsUuid ? `,id.eq.${queryPostId}` : isUuid ? `,id.eq.${idStr}` : ''}`);
      }

      const { data: bPosts, error: postsErr } = await postsQuery;
      if (postsErr) throw postsErr;

      if (bPosts && bPosts.length > 0) {
        const rawPosts = bPosts as unknown as Array<{ post_type?: string }>;
        const lList = rawPosts.filter(
          (p) =>
            p.post_type === 'listing' ||
            p.post_type === 'vacancy' ||
            p.post_type === 'pass_phong' ||
            p.post_type === 'transfer'
        ) as unknown as ListingRecord[];
        const rList = rawPosts.filter((p) => p.post_type === 'review') as unknown as ReviewRecord[];
        const rmList = rawPosts.filter((p) => p.post_type === 'roommate') as unknown as RoommateRecord[];

        setListings(lList);
        setReviews(rList);
        setRoommates(rmList);
      } else {
        setListings([]);
        setReviews([]);
        setRoommates([]);
      }

      if (canonicalNmbId) {
        trackBuildingInspect(canonicalNmbId, undefined, 'detail_pane', {
          listings_count: bPosts?.length || 0,
        });
      }
    } catch (err) {
      console.error('Error loading post/building details:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Master Initial Data Dispatcher
  useEffect(() => {
    let active = true;
    async function initFetch() {
      if (profileId && !elasticId) {
        await loadStandaloneProfile(profileId);
      } else if (elasticId || postId) {
        await loadBuildingData(elasticId || postId || '');
      }
    }
    if (active) {
      initFetch();
    }
    return () => {
      active = false;
    };
  }, [profileId, elasticId, postId, loadStandaloneProfile, loadBuildingData]);

  // Determine Active SubTab dynamically without effect state cascade
  const subTab = useMemo<'listings' | 'reviews' | 'roommates'>(() => {
    if (userSubTab) return userSubTab;
    if (targetIdentifier) {
      if (
        listings.some(
          (l) => l.id.toLowerCase() === targetIdentifier || (l.short_id && l.short_id.toLowerCase() === targetIdentifier)
        )
      ) {
        return 'listings';
      }
      if (
        reviews.some(
          (r) => r.id.toLowerCase() === targetIdentifier || (r.short_id && r.short_id.toLowerCase() === targetIdentifier)
        )
      ) {
        return 'reviews';
      }
      if (
        roommates.some(
          (rm) =>
            rm.id.toLowerCase() === targetIdentifier || (rm.short_id && rm.short_id.toLowerCase() === targetIdentifier)
        )
      ) {
        return 'roommates';
      }
    }
    if (initialTab === 'reviews' && reviews.length > 0) return 'reviews';
    if (initialTab === 'roommates' && roommates.length > 0) return 'roommates';
    if (listings.length === 0 && roommates.length > 0) return 'roommates';
    if (listings.length === 0 && reviews.length > 0) return 'reviews';
    return 'listings';
  }, [userSubTab, targetIdentifier, listings, reviews, roommates, initialTab]);

  const totalPostsCount = listings.length + reviews.length + roommates.length;
  const isSinglePostMode = !standaloneProfile && totalPostsCount === 1;

  // Scroll management for single-post vs multi-post buildings
  useEffect(() => {
    if (loading) return;

    // Helper to find scroll parent
    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (!node) return null;
      let parent = node.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const container = getScrollParent(paneRef.current);

    // Case 1: Building with only 1 post (or single post mode / standalone profile)
    // No scrolling needed, reset scroll offset to 0 (top)
    if (isSinglePostMode || standaloneProfile || totalPostsCount <= 1) {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'instant' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }

    // Case 2: Building with multiple posts
    if (!targetIdentifier) {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      const cleanId = targetIdentifier.toLowerCase();
      const el =
        (paneRef.current?.querySelector(`[data-short-id="${cleanId}"]`) as HTMLElement | null) ||
        (paneRef.current?.querySelector(`[data-post-id="${cleanId}"]`) as HTMLElement | null) ||
        document.getElementById(`post-item-${cleanId}`);

      if (!el) {
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      const headerEl = headerRef.current || (paneRef.current?.querySelector('header') as HTMLElement | null);
      const headerHeight = headerEl ? headerEl.offsetHeight : 0;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const currentScrollTop = container.scrollTop;
        const relativeTop = elRect.top - containerRect.top;
        const targetScrollTop = Math.max(0, currentScrollTop + relativeTop - headerHeight);
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      } else if (typeof window !== 'undefined') {
        const elRect = el.getBoundingClientRect();
        const targetScrollTop = Math.max(0, window.scrollY + elRect.top - headerHeight);
        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loading, isSinglePostMode, standaloneProfile, totalPostsCount, targetIdentifier, subTab]);

  // Favorite handler
  const canonicalFavoriteId = resolvedBuildingId || (standaloneProfile?.short_id || standaloneProfile?.id) || '';
  useEffect(() => {
    if (typeof window !== 'undefined' && canonicalFavoriteId) {
      const favs = getFavorites();
      const match = favs.includes(canonicalFavoriteId) || favs.includes(canonicalFavoriteId.toLowerCase());
      const timer = setTimeout(() => setIsFavorite(match), 0);
      return () => clearTimeout(timer);
    }
  }, [canonicalFavoriteId]);

  const handleToggleFavorite = () => {
    if (!canonicalFavoriteId) return;
    const updated = toggleFavorite(canonicalFavoriteId);
    setIsFavorite(updated.includes(canonicalFavoriteId));
  };

  const handleOpenWriteReview = () => {
    const bId = resolvedBuildingId || '';
    trackFormStep('review_submission', 'started', { building_id: bId });
    if (onRequestWriteReview) {
      onRequestWriteReview(bId);
    } else if (typeof window !== 'undefined') {
      pushHomeSearchParams(
        new URLSearchParams({
          tab: 'review',
          subtab: 'write',
          building: bId,
        })
      );
    }
  };

  const singlePost = isSinglePostMode
    ? (listings[0] || reviews[0] || roommates[0])
    : null;

  const currentCardId = targetIdentifier || (standaloneProfile ? (standaloneProfile.short_id || standaloneProfile.id) : (singlePost ? (singlePost.short_id || singlePost.id) : (resolvedBuildingId || postId || elasticId || profileId || '')));

  // Card Dwell Time & Inspection Depth Tracking
  useEffect(() => {
    const cardId = currentCardId;
    const tabName = subTab || initialTab || 'listings';
    startTimeRef.current = Date.now();
    reachedBottomRef.current = false;
    convertedOutboundRef.current = false;

    return () => {
      const start = startTimeRef.current;
      const dwellSeconds = start > 0 ? Math.max(0, Math.round((Date.now() - start) / 1000)) : 0;
      if (cardId) {
        trackCardDwellTime({
          card_id: cardId,
          tab: tabName,
          dwell_duration_seconds: dwellSeconds,
          reached_bottom: reachedBottomRef.current,
          converted_outbound: convertedOutboundRef.current,
        });
      }
    };
  }, [currentCardId, subTab, initialTab]);

  // Inspection Depth: IntersectionObserver on bottom action row sentinel
  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          reachedBottomRef.current = true;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, isSinglePostMode, standaloneProfile, totalPostsCount, subTab]);

  // Inspection Depth: Scroll listener fallback
  useEffect(() => {
    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (!node) return null;
      let parent = node.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const handleScroll = () => {
      if (reachedBottomRef.current) return;
      const container = getScrollParent(paneRef.current);
      if (container) {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 60) {
          reachedBottomRef.current = true;
        }
      } else if (typeof window !== 'undefined') {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60) {
          reachedBottomRef.current = true;
        }
      }
    };

    const container = getScrollParent(paneRef.current);
    const target = container || (typeof window !== 'undefined' ? window : null);
    if (target) {
      target.addEventListener('scroll', handleScroll, { passive: true });
      return () => target.removeEventListener('scroll', handleScroll);
    }
  }, [loading]);

  const handleConvertedOutbound = useCallback(() => {
    convertedOutboundRef.current = true;
  }, []);

  const handleShareLink = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) return;
    const activeTargetId = currentCardId || resolvedBuildingId || postId || '';
    const shareUrl = buildPostShareUrl(
      activeTargetId,
      singlePost?.content || addressTitle,
      addressTitle,
      subTab
    );
    navigator.clipboard.writeText(shareUrl);
    trackSocialAction({
      action_type: 'copy_link',
      target_type: resolvedBuildingId && !targetIdentifier ? 'building' : 'post',
      target_id: activeTargetId || undefined,
    });
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [currentCardId, resolvedBuildingId, postId, singlePost, addressTitle, subTab, targetIdentifier]);

  const handleCopyAddress = useCallback(() => {
    if (!addressTitle || typeof window === 'undefined' || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(addressTitle);
    const targetId = resolvedBuildingId || currentCardId || postId || undefined;
    trackSocialAction({
      action_type: 'copy_address',
      target_type: resolvedBuildingId ? 'building' : 'post',
      target_id: targetId,
    });
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  }, [addressTitle, resolvedBuildingId, currentCardId, postId]);

  if (loading) {
    return (
      <div className={`p-8 text-center text-xs text-secondary font-semibold ${className}`}>
        Đang tải...
      </div>
    );
  }

  if (!standaloneProfile && totalPostsCount === 0 && !addressTitle) {
    return (
      <div className={`p-6 text-center text-secondary text-xs flex flex-col items-center gap-3 ${className}`}>
        <p className="font-bold text-primary text-sm">Không tìm thấy thông tin bài đăng</p>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="btn-primary text-xs px-4 py-1.5 font-semibold cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: STANDALONE ROOMMATE SEEKER PROFILE
  // ==========================================
  if (standaloneProfile) {
    return (
      <div ref={paneRef} className={`relative flex flex-col bg-surface text-primary ${className}`}>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Header */}
        <header ref={headerRef} className="sticky top-0 z-20 bg-surface border-b border-secondary/20 shadow-xs w-full">
          <div className="w-full flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none" {...dragHandleProps}>
            <div className="w-12 h-1.5 bg-secondary/40 hover:bg-secondary/70 rounded-full transition-colors" />
          </div>
          <div className="px-4 pb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-primary leading-snug flex-1 min-w-0">
                {addressTitle || 'Tìm người ở ghép'}
              </h1>
            </div>
            <div className="flex items-center gap-1 shrink-0 pt-0.5 z-30">
              {onClose && (
                <button
                  type="button"
                  onClick={() => onClose()}
                  aria-label="Đóng"
                  className="p-1 rounded-md text-secondary hover:text-primary hover:bg-neutral transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Standard Post Card: 1. Nguồn/Liên hệ, 2. Specs, 3. Mô tả, 4. Media */}
        <StandardPostCard
          post={getRoommateStandardData(standaloneProfile)}
          isLoggedIn={!!user}
          onRequireAuth={() => (onRequireAuth ? onRequireAuth() : setShowAuthModal(true))}
          onConvertedOutbound={handleConvertedOutbound}
        />

        {/* Bottom Sentinel for Inspection Depth Tracking */}
        <div ref={bottomSentinelRef} className="h-px w-full" aria-hidden="true" />
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SINGLE POST AT ADDRESS (>=90% INVENTORY)
  // Direct post details without building specs, nested cards, or empty tabs
  // ==========================================
  if (isSinglePostMode && singlePost) {
    const singleData: StandardPostData = listings.length > 0
      ? getListingStandardData(listings[0])
      : reviews.length > 0
      ? getReviewStandardData(reviews[0])
      : getRoommateStandardData(roommates[0]);

    return (
      <div ref={paneRef} className={`relative flex flex-col bg-surface text-primary ${className}`}>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Sticky Pinned Header with Drag Handle */}
        <header ref={headerRef} className="sticky top-0 z-20 bg-surface border-b border-secondary/20 shadow-xs w-full">
          <div className="w-full flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none" {...dragHandleProps}>
            <div className="w-12 h-1.5 bg-secondary/40 hover:bg-secondary/70 rounded-full transition-colors" />
          </div>
          <div className="px-4 pb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-primary leading-snug flex-1 min-w-0">
                {addressTitle || 'Chi tiết bài đăng'}
              </h1>
            </div>
            <div className="flex items-center gap-1 shrink-0 pt-0.5 z-30">
              {onClose && (
                <button
                  type="button"
                  onClick={() => onClose()}
                  aria-label="Đóng"
                  className="p-1 rounded-md text-secondary hover:text-primary hover:bg-neutral transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Standard Post Card: 1. Nguồn/Liên hệ, 2. Specs, 3. Mô tả, 4. Media */}
        <StandardPostCard
          post={singleData}
          isLoggedIn={!!user}
          onRequireAuth={() => (onRequireAuth ? onRequireAuth() : setShowAuthModal(true))}
          onConvertedOutbound={handleConvertedOutbound}
        />

        {/* Bottom Sentinel for Inspection Depth Tracking */}
        <div ref={bottomSentinelRef} className="h-px w-full" aria-hidden="true" />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: MULTI-POST SHARED ADDRESS (>= 2 POSTS)
  // Tabbed view: Tin đăng (x) / Review (x) / Ở ghép (x)
  // ==========================================
  return (
    <div ref={paneRef} className={`relative flex flex-col bg-surface text-primary ${className}`}>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-20 bg-surface border-b border-secondary/20 shadow-xs w-full">
        <div className="w-full flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none" {...dragHandleProps}>
          <div className="w-12 h-1.5 bg-secondary/40 hover:bg-secondary/70 rounded-full transition-colors" />
        </div>
        <div className="px-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-primary leading-snug flex-1 min-w-0">
              {addressTitle || 'Địa chỉ'}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5 z-30">
            {onClose && (
              <button
                type="button"
                onClick={() => onClose()}
                aria-label="Đóng"
                className="p-1 rounded-md text-secondary hover:text-primary hover:bg-neutral transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sub-tabs with live counts (scrollable, non-sticky) */}
      <div className="w-full border-b border-secondary/20 px-4 py-3">
        <SegmentedControl
          fullWidth
          options={[
            { key: 'listings', label: `Tin đăng (${listings.length})` },
            { key: 'reviews', label: `Review (${reviews.length})` },
            { key: 'roommates', label: `Ở ghép (${roommates.length})` },
          ]}
          activeKey={subTab}
          onChange={(key) => setUserSubTab(key as 'listings' | 'reviews' | 'roommates')}
        />
      </div>

      {/* Feed List for active tab */}
      <div className="flex flex-col">
        {subTab === 'listings' && (
          listings.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-secondary">Trống</div>
          ) : (
            listings.map((l) => {
              const isHighlighted = Boolean(
                targetIdentifier &&
                (l.id.toLowerCase() === targetIdentifier || (l.short_id && l.short_id.toLowerCase() === targetIdentifier))
              );
              return (
                <StandardPostCard
                  key={l.id}
                  post={getListingStandardData(l)}
                  isHighlighted={isHighlighted}
                  isLoggedIn={!!user}
                  onRequireAuth={() => (onRequireAuth ? onRequireAuth() : setShowAuthModal(true))}
                  onConvertedOutbound={handleConvertedOutbound}
                />
              );
            })
          )
        )}

        {subTab === 'reviews' && (
          reviews.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-secondary">Trống</div>
          ) : (
            reviews.map((rev) => {
              const isHighlighted = Boolean(
                targetIdentifier &&
                (rev.id.toLowerCase() === targetIdentifier || (rev.short_id && rev.short_id.toLowerCase() === targetIdentifier))
              );
              return (
                <StandardPostCard
                  key={rev.id}
                  post={getReviewStandardData(rev)}
                  isHighlighted={isHighlighted}
                  isLoggedIn={!!user}
                  onRequireAuth={() => (onRequireAuth ? onRequireAuth() : setShowAuthModal(true))}
                  onConvertedOutbound={handleConvertedOutbound}
                />
              );
            })
          )
        )}

        {subTab === 'roommates' && (
          roommates.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-secondary">Trống</div>
          ) : (
            roommates.map((rm) => {
              const isHighlighted = Boolean(
                targetIdentifier &&
                (rm.id.toLowerCase() === targetIdentifier || (rm.short_id && rm.short_id.toLowerCase() === targetIdentifier))
              );
              return (
                <StandardPostCard
                  key={rm.id}
                  post={getRoommateStandardData(rm)}
                  isHighlighted={isHighlighted}
                  isLoggedIn={!!user}
                  onRequireAuth={() => (onRequireAuth ? onRequireAuth() : setShowAuthModal(true))}
                  onConvertedOutbound={handleConvertedOutbound}
                />
              );
            })
          )
        )}
      </div>

      {/* Bottom Sentinel for Inspection Depth Tracking */}
      <div ref={bottomSentinelRef} className="h-px w-full" aria-hidden="true" />
    </div>
  );
}
