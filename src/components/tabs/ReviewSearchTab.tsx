'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import { sanitizeErrorMessage } from '@/lib/utils/error-sanitizer';
import type { MapReviewPin } from '@/components/InteractiveMap';
import {
  appendLocationParams,
  locationFromSearchParams,
  matchesLocationSelection,
  parseGeographyPoint,
  distanceMeters,
  getWardCoordinates,
  getWardCoordinatesByCode,
  CityCode,
  resolveEntityCity,
  DEFAULT_HANOI_CENTER,
  DEFAULT_HCMC_CENTER,
  type LocationSelection,
} from '@/lib/location';
import { useCityState } from '@/lib/city-state';
import {
  handleHoverMarqueeEnter,
  handleHoverMarqueeLeave,
  parseKeywords,
  matchesKeywords,
  matchesTargetedReviewSearch,
  ReviewSearchMode,
} from '@/lib/search';
import ReviewCard from '@/components/ReviewCard';
import ListingCard from '@/components/ListingCard';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';
import MapPickerToolbar from '@/components/ui/MapPickerToolbar';
import BuildingDetailPane from '@/components/BuildingDetailPane';
import BottomSheet, { SnapState } from '@/components/ui/BottomSheet';
import LocationSelectDropdown from '@/components/ui/LocationSelectDropdown';
import AddressSelectDropdown from '@/components/ui/AddressSelectDropdown';
import DynamicSuggestionChips, { type ChipCategory } from '@/components/ui/DynamicSuggestionChips';
import MediaUploader from '@/components/ui/MediaUploader';
import ContactField from '@/components/ui/ContactField';
import { getUserContact, saveUserContact } from '@/lib/contact';
import { pushHomeSearchParams, replaceHomeSearchParams } from '@/lib/home-url-state';
import {
  applyFeedSort,
  isFeedSortOrder,
  toTimestamp,
  FEED_SORT_OPTIONS,
  type FeedSortOrder,
} from '@/lib/sorting';
import { useGeoAnchor } from '@/hooks/useGeoAnchor';
import FeedSelectDropdown, { type FeedSelectOption } from '@/components/ui/FeedSelectDropdown';
import ZeroStateRecoveryBox from '@/components/ui/ZeroStateRecoveryBox';
import {
  trackSearch,
  trackBuildingInspect,
  trackFormStep,
  trackFilterApplied,
  trackViewModeToggled,
} from '@/lib/telemetry';

export const REVIEW_SEARCH_MODE_OPTIONS: FeedSelectOption<ReviewSearchMode>[] = [
  { value: 'phone', label: 'SĐT' },
  { value: 'address', label: 'Địa chỉ cụ thể' },
  { value: 'brand', label: 'Thương hiệu' },
];

const REVIEW_SORT_OPTIONS: FeedSelectOption<FeedSortOrder>[] = FEED_SORT_OPTIONS.filter(
  (opt) => opt.value === 'newest' || opt.value === 'closest'
);

const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'positive', label: 'Tích cực' },
  { value: 'negative', label: 'Tiêu cực' },
];

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-gray-100 flex items-center justify-center border border-secondary text-secondary rounded-md font-semibold text-sm">
      Đang tải...
    </div>
  ),
});

export interface Review {
  id: string;
  short_id?: string | null;
  title?: string;
  building_id?: string | null;
  house_id: string | null;
  room_id: string | null;
  rating: number;
  price?: number;
  contact_info?: string | null;
  target_phone?: string | null;
  target_brand?: string | null;
  content: string | null;
  description?: string | null;
  reviewer_role: string | null;
  post_type?: string | null;
  source_type?: string | null;
  source_url: string | null;
  published_at?: string | null;
  media?: string[] | null;
  media_manifest?: unknown;
  extracted_data?: any;
  address_masked: string | null;
  source_provenance: string | null;
  created_at: string;
  ward_code: string | null;
  distanceMeters?: number | null;
  buildings?: {
    ward_code: string | null;
    canonical_location: unknown;
    address_text: string | null;
  } | null;
  houses?: {
    ward_code: string | null;
    canonical_location: unknown;
    address_text: string | null;
  } | null;
}

function cleanAddressTitle(address: string | null): string {
  if (!address) return 'Hà Nội';
  let clean = address
    .replace(/^(?:khu\s+vực\s+)*/gi, '')
    .trim();
  clean = clean.replace(/^(?:khu\s+vực\s+phường|phường)\s*/gi, '').trim();
  return clean || 'Hà Nội';
}

function cleanContentBody(content: string | null): string {
  if (!content) return '';
  let clean = content
    .replace(/^Khu\s+vực[^\n]*\n+/gi, '')
    .trim();
  return clean;
}

export type ReviewSubTab = 'all' | 'search' | 'post';

const SUBTAB_OPTIONS: SegmentedOption[] = [
  { key: 'all', label: 'Đọc review' },
  { key: 'search', label: 'Tìm review' },
  { key: 'post', label: 'Viết review' },
];

export interface ReviewSearchTabProps {
  className?: string;
  initialQuery?: string;
  initialLocation?: LocationSelection | null;
  showSearchBar?: boolean;
  activeCity?: CityCode;
  mobileViewMode?: 'list' | 'map';
  onMobileViewModeChange?: (mode: 'list' | 'map') => void;
}

export default function ReviewSearchTab({
  className = '',
  initialQuery,
  initialLocation: initialLocationProp,
  showSearchBar = true,
  activeCity,
  mobileViewMode: propMobileViewMode,
  onMobileViewModeChange,
}: ReviewSearchTabProps) {
  const searchParams = useSearchParams();
  const { activeCity: hookCity } = useCityState();
  const currentCity = activeCity || hookCity;

  const urlQ = searchParams?.get('q') || '';
  const searchParamsKey = searchParams?.toString() || '';
  const sortParam = searchParams?.get('sort') || '';
  const ratingParam = searchParams?.get('rating') || '';
  const urlLocation = useMemo(
    () => (searchParamsKey ? locationFromSearchParams(new URLSearchParams(searchParamsKey)) : null),
    [searchParamsKey]
  );
  const subTabParam: ReviewSubTab =
    searchParams?.get('subtab') === 'search'
      ? 'search'
      : searchParams?.get('subtab') === 'write' || searchParams?.get('subtab') === 'post'
      ? 'post'
      : 'all';

  const activeInitialQ = initialQuery !== undefined ? initialQuery : urlQ;
  const activeInitialLocation = initialLocationProp !== undefined ? initialLocationProp : urlLocation;

  const supabase = createClient();

  // Sub-tab state
  const [subTab, setSubTab] = useState<ReviewSubTab>(subTabParam);

  // Sort state
  const [sortOrder, setSortOrder] = useState<FeedSortOrder>(
    isFeedSortOrder(sortParam) &&
    REVIEW_SORT_OPTIONS.some((opt) => opt.value === (sortParam as FeedSortOrder))
      ? (sortParam as FeedSortOrder)
      : 'newest'
  );

  // Rating filter state
  // Rating filter state
  const [ratingFilter, setRatingFilter] = useState<'all' | 'positive' | 'negative'>(
    ratingParam === 'positive' || ratingParam === 'negative' ? ratingParam : 'all'
  );

  // Targeted Search Mode State: SĐT | Địa chỉ | Thương hiệu
  const modeParam = searchParams?.get('mode');
  const [searchMode, setSearchMode] = useState<ReviewSearchMode>(
    modeParam === 'address' || modeParam === 'brand' ? modeParam : 'phone'
  );

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState(activeInitialQ);
  const [locationFilter, setLocationFilter] = useState<LocationSelection | null>(activeInitialLocation);
  const locationFilterRef = useRef<LocationSelection | null>(activeInitialLocation);
  useEffect(() => {
    locationFilterRef.current = locationFilter;
  }, [locationFilter]);
  const [loading, setLoading] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [snapState, setSnapState] = useState<SnapState>('peek');
  const [internalMobileViewMode, setInternalMobileViewMode] = useState<'list' | 'map'>('list');
  const mobileViewMode = propMobileViewMode ?? internalMobileViewMode;
  const setMobileViewMode = useCallback(
    (mode: 'list' | 'map') => {
      setInternalMobileViewMode(mode);
      onMobileViewModeChange?.(mode);
      trackViewModeToggled({
        tab: 'review',
        mode: mode === 'map' ? 'map_view' : 'list_view',
        sheet_state: snapState,
      });
    },
    [onMobileViewModeChange, snapState]
  );
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [hoveredReviewId, setHoveredReviewId] = useState<string | null>(null);
  const buildingParam = searchParams?.get('building') || searchParams?.get('place') || searchParams?.get('id') || null;
  const postParam = searchParams?.get('post') || searchParams?.get('review') || null;
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(buildingParam);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(postParam);
  const leftColRef = useRef<HTMLDivElement>(null);
  const listHeaderRef = useRef<HTMLDivElement>(null);

  // User Auth & Modal States
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Pagination / Lazy feed rendering
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Write Review Form State
  const [formAddress, setFormAddress] = useState('');
  const [formPoint, setFormPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [formContact, setFormContact] = useState('');
  const [saveFormContactForLater, setSaveFormContactForLater] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const [activeFocus, setActiveFocus] = useState<ChipCategory>('default');

  useEffect(() => {
    setVisibleCount(20);
  }, [urlQ, sortOrder, ratingFilter, searchMode, subTab, formPoint]);

  useEffect(() => {
    if (modeParam === 'address' || modeParam === 'brand' || modeParam === 'phone') {
      setSearchMode(modeParam);
    }
  }, [modeParam]);

  // Mobile map view & picking mode document scroll lock
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 1024;
    const shouldLock = isMobile && (mobileViewMode === 'map' || isPickingLocation);
    if (shouldLock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileViewMode, isPickingLocation]);

  // Sort anchor for "Gần nhất" (active location selection, else device GPS)
  const geoAnchor = useGeoAnchor(
    locationFilter,
    subTab === 'all' && sortOrder === 'closest'
  );

  const handleSortChange = (order: FeedSortOrder) => {
    setSortOrder(order);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('sort', order);
    replaceHomeSearchParams(params);
  };

  const handleRatingFilterChange = (value: string) => {
    const next = value === 'positive' || value === 'negative' ? value : 'all';
    setRatingFilter(next);
    trackFilterApplied({
      tab: 'review',
      filter_name: 'rating',
      filter_value: next,
      new_result_count: filteredReviews.length,
      is_zero_result: filteredReviews.length === 0,
    });
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (next === 'all') {
      params.delete('rating');
    } else {
      params.set('rating', next);
    }
    replaceHomeSearchParams(params);
  };

  // City Filtered Reviews
  const cityFilteredAllReviews = useMemo(() => {
    return allReviews.filter((r) => resolveEntityCity(r as any) === currentCity);
  }, [allReviews, currentCity]);

  const cityFilteredReviews = useMemo(() => {
    return filteredReviews.filter((r) => resolveEntityCity(r as any) === currentCity);
  }, [filteredReviews, currentCity]);

  // Sorted browse feed (read mode only; write mode keeps its nearby ordering)
  const sortedReviews = useMemo(() => {
    if (subTab !== 'all') return cityFilteredReviews;
    let list = cityFilteredReviews;
    if (ratingFilter === 'positive') {
      list = list.filter((r) => r.rating !== null && r.rating !== undefined && r.rating >= 3);
    } else if (ratingFilter === 'negative') {
      list = list.filter((r) => r.rating !== null && r.rating !== undefined && r.rating < 3);
    }
    return applyFeedSort(list, sortOrder, (r) => {
      const price = r.price && r.price > 0 ? r.price : null;
      const bObj = (r as any).buildings || (r as any).houses;
      const geo = parseGeographyPoint(
        bObj?.canonical_location || (r as any).canonical_location || (r as any).extracted_data?.geo_info
      );
      return {
        priceLow: price,
        priceHigh: price,
        date: toTimestamp(r.published_at || (r as any).extracted_data?.published_at || r.created_at),
        distance: geo && geoAnchor ? distanceMeters(geoAnchor, geo) : null,
      };
    });
  }, [cityFilteredReviews, subTab, sortOrder, ratingFilter, geoAnchor]);

  const cityFilteredMapPins = useMemo(() => {
    const grouped = new Map<string, any[]>();
    sortedReviews.forEach((r) => {
      const bId = r.building_id || (r as any).buildings?.nmb_id || r.house_id || (r.extracted_data?.address_raw ? `unanchored:${r.extracted_data.address_raw}` : r.short_id || r.id);
      if (!grouped.has(bId)) grouped.set(bId, []);
      grouped.get(bId)!.push(r);
    });

    const pins: MapReviewPin[] = [];
    grouped.forEach((bPosts, bId) => {
      const first = bPosts[0];
      const bObj = first.buildings || first.houses;
      let geo = parseGeographyPoint(
        bObj?.canonical_location || first.canonical_location
      );
      if (!geo && first.extracted_data?.lat && first.extracted_data?.lng) {
        geo = {
          lat: Number(first.extracted_data.lat),
          lng: Number(first.extracted_data.lng),
        };
      }
      const rawLocation =
        first.buildings?.address_text ||
        first.buildings?.street_text ||
        first.extracted_data?.address_raw ||
        first.address_masked ||
        (currentCity === 'SG' ? 'Sài Gòn' : 'Hà Nội');

      if (!geo) {
        geo = getWardCoordinatesByCode(bId, currentCity) || getWardCoordinates(rawLocation, currentCity) || null;
      }
      if (!geo) return;

      const reviewPosts = bPosts.filter((r) => r.post_type === 'review');
      const listingPosts = bPosts.filter((r) => r.post_type !== 'review');
      const minPrice = listingPosts.reduce(
        (min, p) => (p.price && p.price > 0 ? Math.min(min, p.price) : min),
        Infinity
      );

      const avgRating =
        reviewPosts.length > 0
          ? reviewPosts.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewPosts.length
          : undefined;

      const targetBuildingId = first.building_id || (first as any).buildings?.nmb_id || first.house_id || null;

      pins.push({
        id: targetBuildingId || first.short_id || first.id || bId,
        postId: first.short_id || first.id,
        targetPostId: first.short_id || first.id,
        buildingId: targetBuildingId || undefined,
        houseId: targetBuildingId || undefined,
        address: cleanAddressTitle(rawLocation),
        lat: geo.lat,
        lng: geo.lng,
        riskLabels: [],
        reviewCount: reviewPosts.length,
        price: minPrice !== Infinity ? minPrice : undefined,
        snippet: first.content || first.description || '',
        rating: avgRating,
        reviewerRole: first.reviewer_role,
        publishedAt: first.published_at || first.extracted_data?.published_at || null,
        createdAt: first.created_at,
        sourceUrl: first.source_url || undefined,
        sourceType: first.source_type || undefined,
      });
    });
    return pins;
  }, [sortedReviews]);

  const displayedReviews = useMemo(() => {
    if (subTab === 'post') {
      if (!formPoint) {
        return [];
      }
      const anchorPoint = formPoint;
      const withDistance = cityFilteredAllReviews
        .map((r) => {
          const bObj = (r as any).buildings || (r as any).houses;
          const geo =
            parseGeographyPoint(bObj?.canonical_location || (r as any).canonical_location) ||
            (r.extracted_data?.lat && r.extracted_data?.lng
              ? { lat: Number(r.extracted_data.lat), lng: Number(r.extracted_data.lng) }
              : null);
          if (geo) {
            const dist = distanceMeters(anchorPoint, geo);
            return { ...r, distanceMeters: dist };
          }
          return { ...r, distanceMeters: null };
        })
        .filter((r) => r.distanceMeters != null && Number.isFinite(r.distanceMeters) && r.distanceMeters <= 3000);

      withDistance.sort((a, b) => a.distanceMeters! - b.distanceMeters!);
      return withDistance.slice(0, 10);
    }
    return sortedReviews;
  }, [subTab, formPoint, cityFilteredAllReviews, sortedReviews]);

  const displayedPins = useMemo(() => {
    if (subTab === 'post') {
      const targetPosts = formPoint ? displayedReviews : cityFilteredAllReviews;
      const grouped = new Map<string, any[]>();
      targetPosts.forEach((r) => {
        const bId = r.building_id || (r as any).buildings?.nmb_id || (r as any).house_id || (r.extracted_data?.address_raw ? `unanchored:${r.extracted_data.address_raw}` : r.short_id || r.id);
        if (!grouped.has(bId)) grouped.set(bId, []);
        grouped.get(bId)!.push(r);
      });

      const pins: MapReviewPin[] = [];
      grouped.forEach((bPosts, bId) => {
        const first = bPosts[0];
        const bObj = first.buildings || first.houses;
        let geo = parseGeographyPoint(
          bObj?.canonical_location || first.canonical_location
        );
        if (!geo && first.extracted_data?.lat && first.extracted_data?.lng) {
          geo = {
            lat: Number(first.extracted_data.lat),
            lng: Number(first.extracted_data.lng),
          };
        }
        const rawLocation =
          first.buildings?.address_text ||
          first.buildings?.street_text ||
          first.extracted_data?.address_raw ||
          first.address_masked ||
          (currentCity === 'SG' ? 'Sài Gòn' : 'Hà Nội');

        if (!geo) {
          geo = getWardCoordinatesByCode(bId, currentCity) || getWardCoordinates(rawLocation, currentCity) || null;
        }
        if (!geo) return;

        const reviewPosts = bPosts.filter((r) => r.post_type === 'review');
        const listingPosts = bPosts.filter((r) => r.post_type !== 'review');
        const minPrice = listingPosts.reduce(
          (min, p) => (p.price && p.price > 0 ? Math.min(min, p.price) : min),
          Infinity
        );

        const avgRating =
          reviewPosts.length > 0
            ? reviewPosts.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewPosts.length
            : undefined;

        const targetBuildingId = first.building_id || (first as any).buildings?.nmb_id || (first as any).house_id || null;

        pins.push({
          id: targetBuildingId || first.short_id || first.id || bId,
          postId: first.short_id || first.id,
          targetPostId: first.short_id || first.id,
          buildingId: targetBuildingId || undefined,
          houseId: targetBuildingId || undefined,
          address: cleanAddressTitle(rawLocation),
          lat: geo.lat,
          lng: geo.lng,
          riskLabels: [],
          reviewCount: reviewPosts.length,
          price: minPrice !== Infinity ? minPrice : undefined,
          snippet: first.content || first.description || '',
          rating: avgRating,
          reviewerRole: first.reviewer_role,
          publishedAt: first.published_at || first.extracted_data?.published_at || null,
          createdAt: first.created_at,
          sourceUrl: first.source_url || undefined,
          sourceType: first.source_type || undefined,
        });
      });
      return pins;
    }
    return cityFilteredMapPins;
  }, [subTab, formPoint, displayedReviews, cityFilteredAllReviews, cityFilteredMapPins]);

  const selectedBuildingPin = useMemo(() => {
    if (!selectedBuildingId) return null;
    return (
      displayedPins.find(
        (p) =>
          p.buildingId?.toLowerCase() === selectedBuildingId.toLowerCase() ||
          p.id?.toLowerCase() === selectedBuildingId.toLowerCase()
      ) || null
    );
  }, [displayedPins, selectedBuildingId]);

  const selectedBuildingAddress = selectedBuildingPin?.address || '';

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayedReviews.length, visibleCount]);

  useEffect(() => {
    setSubTab(subTabParam);
  }, [subTabParam]);

  useEffect(() => {
    setSortOrder(
      isFeedSortOrder(sortParam) &&
      REVIEW_SORT_OPTIONS.some((opt) => opt.value === (sortParam as FeedSortOrder))
        ? (sortParam as FeedSortOrder)
        : 'newest'
    );
  }, [sortParam]);

  useEffect(() => {
    setRatingFilter(ratingParam === 'positive' || ratingParam === 'negative' ? ratingParam : 'all');
  }, [ratingParam]);

  useEffect(() => {
    if (activeInitialLocation) {
      setLocationFilter(activeInitialLocation);
    }
  }, [activeInitialLocation]);

  useEffect(() => {
    setSearchQuery(urlQ);
  }, [urlQ]);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFormContact((prev) => prev || getUserContact(user));
      }
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setFormContact((prev) => prev || getUserContact(session.user));
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSelectBuilding = (buildingId: string | null, postId?: string | null) => {
    const cleanBuildingId = buildingId && buildingId.trim() ? buildingId.trim() : null;
    const cleanPostId = postId && postId.trim() ? postId.trim() : null;

    setSelectedBuildingId(cleanBuildingId);
    setSelectedPostId(cleanPostId);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (cleanBuildingId || cleanPostId) {
        if (cleanBuildingId) {
          trackBuildingInspect(cleanBuildingId, 'review', 'review');
          params.set('building', cleanBuildingId);
        } else {
          params.delete('building');
        }
        if (cleanPostId) {
          params.set('post', cleanPostId);
        } else {
          params.delete('post');
        }
        setSnapState('peek');
        params.delete('review');
        params.delete('place');
        params.delete('id');
        replaceHomeSearchParams(params);
      } else {
        params.delete('building');
        params.delete('post');
        params.delete('review');
        params.delete('place');
        params.delete('id');
        replaceHomeSearchParams(params);
      }
    }
  };

  const handleRequestWriteReview = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedPostId(null);
    setSnapState('peek');
    setSubTab('post');
    setFormError('');
    setSuccessNotice('');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'review');
      params.set('subtab', 'post');
      params.set('building', buildingId);
      params.delete('post');
      params.delete('review');
      params.delete('type');
      pushHomeSearchParams(params);
    }
  };

  const handleCloseLocationPicker = () => {
    setIsPickingLocation(false);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileViewMode('list');
    }
    if (subTab === 'all') {
      const current = locationFilterRef.current;
      if (current) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('ward');
        params.delete('lat');
        params.delete('lng');
        params.delete('radius');
        params.delete('location_type');
        appendLocationParams(params, current);
        pushHomeSearchParams(params);
      }
    }
  };

  const toggleLocationPicker = () => {
    setIsPickingLocation((current) => {
      const next = !current;
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setMobileViewMode(next ? 'map' : 'list');
      }
      return next;
    });
  };

  const handlePointSelect = (point: { lat: number; lng: number }) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileViewMode('map');
    }
    if (subTab === 'post') {
      setFormPoint(point);
    } else {
      const updated: LocationSelection = {
        type: 'radius',
        lat: point.lat,
        lng: point.lng,
        radiusM: 1000,
        label: 'Khu vực 1km đã chọn',
      };
      setLocationFilter(updated);
      locationFilterRef.current = updated;
      const params = new URLSearchParams(searchParams?.toString() || '');
      appendLocationParams(params, updated);
      replaceHomeSearchParams(params);
    }
  };

  const handleSubTabChange = (key: string) => {
    const newTab = key as ReviewSubTab;
    setSubTab(newTab);
    setFormError('');
    setSuccessNotice('');
    setIsPickingLocation(false);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', 'review');
    params.delete('type');
    if (newTab === 'all') {
      params.delete('subtab');
      params.delete('q');
      params.delete('mode');
    } else if (newTab === 'search') {
      params.set('subtab', 'search');
      params.delete('lat');
      params.delete('lng');
      params.delete('radius');
      params.delete('ward');
      params.delete('ward_codes');
    } else {
      params.set('subtab', 'post');
    }
    pushHomeSearchParams(params);
  };

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      let postsData: any[] | null = null;
      let { data: primaryData, error } = await supabase
        .from('posts')
        .select('*, buildings:building_id(nmb_id, ward_code, canonical_location, address_text, street_text, house_number)')
        .eq('status', 'approved')
        .eq('post_type', 'review')
        .order('created_at', { ascending: false })
        .limit(400);

      if (error) {
        console.warn('Primary posts review query warning, executing fallback query:', error);
        const fallbackRes = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'approved')
          .eq('post_type', 'review')
          .order('created_at', { ascending: false })
          .limit(400);

        if (!fallbackRes.error) {
          postsData = fallbackRes.data;
          error = null;
        }
      } else {
        postsData = primaryData;
      }

      if (error) throw error;
      const fetched = (postsData as any[]) || [];

      const seen = new Set<string>();
      const uniquePosts: any[] = [];

      fetched.forEach((r) => {
        const rawAddr =
          r.extracted_data?.address_raw ||
          r.buildings?.address_text ||
          r.houses?.address_text ||
          r.address_masked ||
          r.title ||
          r.house_id ||
          r.building_id;
        const title = cleanAddressTitle(rawAddr);
        const body = cleanContentBody(r.content || r.description);
        const key = `${r.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniquePosts.push({
            ...r,
            title,
            address_masked: title,
            content: body,
            description: body,
          });
        }
      });

      setAllReviews(uniquePosts);

      const reviewPosts = uniquePosts.filter((p) => p.post_type === 'review');

      if (subTab === 'search') {
        if (activeInitialQ.trim()) {
          const filtered = reviewPosts.filter((r) =>
            matchesTargetedReviewSearch(activeInitialQ, searchMode, r)
          );
          setFilteredReviews(filtered);
        } else {
          setFilteredReviews([]);
        }
      } else if (subTab === 'all') {
        if (activeInitialLocation) {
          const filtered = reviewPosts.filter((review) => {
            const bObj = review.buildings || review.houses;
            return matchesLocationSelection(
              activeInitialLocation,
              bObj?.ward_code || review.ward_code,
              bObj?.canonical_location,
              review.address_masked
            );
          });
          setFilteredReviews(filtered);
        } else {
          setFilteredReviews([]);
        }
      } else {
        setFilteredReviews(reviewPosts);
      }

      const reviewWardCodes = activeInitialLocation
        ? (activeInitialLocation.type === 'ward' ? (activeInitialLocation.wardCodes || [activeInitialLocation.wardCode]) : (activeInitialLocation.wardCode ? [activeInitialLocation.wardCode] : []))
        : [];
      trackSearch({
        tab: 'review',
        ward_codes: reviewWardCodes,
        result_count: filteredReviews.length,
        utm_source: searchParams?.get('utm_source') || undefined,
        utm_campaign: searchParams?.get('utm_campaign') || undefined,
        extra: {
          subtab: subTab,
          search_query: activeInitialQ.trim() || undefined,
          search_mode: searchMode,
          has_location: Boolean(activeInitialLocation),
        },
      });
    } catch (err) {
      console.error('Error fetching reviews feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [supabase, subTab, activeInitialQ, activeInitialLocation, searchMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackFilterApplied({
      tab: 'review',
      filter_name: 'search_filters',
      filter_value: {
        mode: searchMode,
        keyword: searchQuery,
      },
      previous_result_count: filteredReviews.length,
      new_result_count: filteredReviews.length,
      is_zero_result: filteredReviews.length === 0,
    });
    const params = new URLSearchParams();
    params.set('tab', 'review');
    params.set('subtab', 'search');
    params.set('mode', searchMode);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (ratingFilter !== 'all') params.set('rating', ratingFilter);
    if (sortOrder !== 'newest') params.set('sort', sortOrder);
    pushHomeSearchParams(params);
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setLocationFilter(null);
    locationFilterRef.current = null;
    setRatingFilter('all');
    const params = new URLSearchParams();
    params.set('tab', 'review');
    if (subTab === 'search') {
      params.set('subtab', 'search');
      params.set('mode', searchMode);
    } else if (subTab === 'post') {
      params.set('subtab', 'post');
    }
    pushHomeSearchParams(params);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setFormError('');
    setSuccessNotice('');

    if (!formAddress.trim()) {
      setFormError('Vui lòng nhập địa chỉ tòa nhà hoặc chọn vị trí trên bản đồ.');
      return;
    }

    if (formContent.trim().length < 10) {
      setFormError('Nội dung đánh giá cần ít nhất 10 ký tự.');
      return;
    }

    setFormSubmitting(true);

    try {
      if (selectedBuildingId) {
        // Direct review insert attached to existing building
        const { error: insertError } = await (supabase.from('posts') as any).insert([
          {
            building_id: selectedBuildingId,
            user_id: user.id,
            post_type: 'review',
            author_role: 'former_tenant',
            source_type: 'direct_user',
            source_url: null,
            contact_info: formContact.trim() || null,
            content: formContent.trim(),
            rating: formRating,
            media: formImages,
            status: 'approved',
            published_at: new Date().toISOString(),
          },
        ]);
        if (insertError) throw insertError;
      } else {
        // Pending review for new unanchored building
        const { error: rpcError } = await (supabase as any).rpc('create_building_review_post', {
          p_rating: formRating,
          p_content: formContent.trim(),
          p_address_text: formAddress.trim(),
          p_lat: formPoint?.lat || undefined,
          p_lng: formPoint?.lng || undefined,
          p_contact_info: formContact.trim() || null,
        });

        if (rpcError) {
          console.warn('RPC create_building_review_post execution error, falling back to direct table insert:', rpcError);
          const { error: insertError } = await (supabase.from('posts') as any).insert([
            {
              building_id: null,
              user_id: user.id,
              post_type: 'review',
              author_role: 'former_tenant',
              source_type: 'direct_user',
              source_url: null,
              contact_info: formContact.trim() || null,
              content: formContent.trim(),
              rating: formRating,
              media: formImages,
              status: 'pending',
              extracted_data: {
                address_raw: formAddress.trim(),
                lat: formPoint?.lat || null,
                lng: formPoint?.lng || null,
                contact_info: formContact.trim() || null,
              },
              published_at: new Date().toISOString(),
            },
          ]);
          if (insertError) throw insertError;
        }
      }

      if (saveFormContactForLater && formContact.trim()) {
        await saveUserContact(supabase, formContact);
      }

      setSuccessNotice(
        selectedBuildingId
          ? 'Đánh giá của bạn đã được đăng thành công!'
          : 'Đánh giá của bạn đã được gửi thành công và đang chờ duyệt.'
      );
      setFormContent('');
      setFormContact('');
      setFormRating(5);
      setFormImages([]);
      if (!selectedBuildingId) {
        setFormAddress('');
        setFormPoint(null);
        setIsPickingLocation(false);
      }
      trackFormStep('review_submission', 'submitted', {
        building_id: selectedBuildingId || null,
        rating: formRating,
      });
      setTimeout(() => setSuccessNotice(''), 5000);
      fetchReviewsData();
    } catch (err: any) {
      console.error('Error submitting review:', err?.message || err?.details || err);
      setFormError(sanitizeErrorMessage(err?.message || err?.details || 'Có lỗi xảy ra khi gửi đánh giá.'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSelectLocationChip = (selection: LocationSelection) => {
    setLocationFilter(selection);
  };

  const handleSelectKeywordChip = (keyword: string) => {
    const currentTokens = parseKeywords(searchQuery);
    const lowerKw = keyword.toLowerCase();
    if (currentTokens.includes(lowerKw)) {
      const nextTokens = currentTokens.filter((t) => t !== lowerKw);
      setSearchQuery(nextTokens.join(', '));
    } else {
      const next = searchQuery ? `${searchQuery}, ${keyword}` : keyword;
      setSearchQuery(next);
    }
  };

  const shouldShowCompactMapPicker = isPickingLocation;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Top Search Bar & Inline Sub-Tabs Form */}
      <div
        data-testid="home-search-panel"
        data-map-picker-controls
        hidden={!showSearchBar}
        className={[
          'bg-surface border border-secondary p-3 sm:p-4 rounded-xl shadow-sm flex-col gap-3',
          isPickingLocation || mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex',
        ].join(' ')}
      >
        {subTab === 'all' ? (
          <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              {/* Spatial Location Filter (1km radius) */}
              <div className="flex-1 min-w-0">
                <LocationSelectDropdown
                  value={locationFilter}
                  onChange={(nextLocation) => {
                    setLocationFilter(nextLocation);
                    locationFilterRef.current = nextLocation;
                    const params = new URLSearchParams(searchParams?.toString() || '');
                    appendLocationParams(params, nextLocation);
                    replaceHomeSearchParams(params);
                  }}
                  onToggleMapPicker={toggleLocationPicker}
                  isMapPicking={isPickingLocation}
                  onFocusInput={() => {
                    setActiveFocus('location');
                    setIsPickingLocation(true);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setMobileViewMode('map');
                    }
                  }}
                  onClose={handleCloseLocationPicker}
                  placeholder="Chọn khu vực xem review (bán kính 1km)..."
                />
              </div>

              {/* Subtab Segmented Control: Đọc review | Tìm review | Viết review */}
              <div className="flex shrink-0">
                <SegmentedControl
                  ariaLabel="Review mode"
                  fullWidth
                  options={SUBTAB_OPTIONS}
                  activeKey={subTab}
                  onChange={handleSubTabChange}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </form>
        ) : subTab === 'search' ? (
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              {/* Search Mode Dropdown: SĐT | Địa chỉ | Thương hiệu */}
              <div className="w-full md:w-[170px] shrink-0">
                <FeedSelectDropdown
                  label="Loại tra cứu"
                  value={searchMode}
                  options={REVIEW_SEARCH_MODE_OPTIONS}
                  onChange={(val) => {
                    const nextMode = val as ReviewSearchMode;
                    setSearchMode(nextMode);
                    const params = new URLSearchParams(searchParams?.toString() || '');
                    params.set('tab', 'review');
                    params.set('subtab', 'search');
                    params.set('mode', nextMode);
                    if (searchQuery.trim()) params.set('q', searchQuery.trim());
                    replaceHomeSearchParams(params);
                  }}
                />
              </div>

              {/* Targeted Entity Omnibox */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type={searchMode === 'phone' ? 'tel' : 'text'}
                  className="input-field w-full text-xs md:text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
                  placeholder={
                    searchMode === 'phone'
                      ? 'Nhập SĐT cần kiểm tra (VD: 0987654321)...'
                      : searchMode === 'address'
                      ? 'Nhập số nhà, ngõ, tên đường (VD: 15 ngõ 165 Cầu Giấy)...'
                      : 'Nhập tên thương hiệu / chuỗi (VD: Nhà Xinh, 90land)...'
                  }
                  value={searchQuery}
                  onFocus={() => setActiveFocus('keyword')}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      const params = new URLSearchParams(searchParams?.toString() || '');
                      params.delete('q');
                      params.set('tab', 'review');
                      params.set('subtab', 'search');
                      params.set('mode', searchMode);
                      pushHomeSearchParams(params);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary text-xs font-bold p-1 cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex shrink-0">
                <SegmentedControl
                  ariaLabel="Review mode"
                  fullWidth
                  options={SUBTAB_OPTIONS}
                  activeKey={subTab}
                  onChange={handleSubTabChange}
                  className="w-full md:w-auto"
                />
              </div>

              <button
                type="submit"
                className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold shrink-0 min-w-[80px] flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Đang tải...' : 'Tra cứu'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
            {/* Address Select Dropdown */}
            <div className="w-full">
              <AddressSelectDropdown
                address={formAddress}
                point={formPoint}
                onChangeAddress={(addr) => {
                  setFormAddress(addr);
                  setFormError('');
                }}
                onChangePoint={(pt) => setFormPoint(pt)}
                onToggleMapPicker={toggleLocationPicker}
                isMapPicking={isPickingLocation}
                onFocusInput={() => {
                  setIsPickingLocation(true);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setMobileViewMode('map');
                  }
                }}
                onClose={handleCloseLocationPicker}
                placeholder="Địa chỉ"
              />
            </div>

            {/* Contact Info Input (Optional) */}
            <div className="w-full">
              <ContactField
                placeholder="Thông tin liên hệ (SĐT/Zalo, Facebook, Instagram) (Không bắt buộc)"
                value={formContact}
                onChange={setFormContact}
                showSaveOption
                saveForLater={saveFormContactForLater}
                onSaveForLaterChange={setSaveFormContactForLater}
              />
            </div>

            {/* Dedicated Multi-line Content Box */}
            <div className="w-full">
              <textarea
                id="review-write-content"
                rows={3}
                className="input-field w-full text-xs md:text-sm p-3 focus:outline-none focus:ring-1 focus:ring-primary rounded-md font-sans leading-relaxed resize-y min-h-[72px]"
                placeholder="Nội dung đánh giá (trải nghiệm thực tế, chi phí phát sinh, thái độ chủ nhà, an ninh, phòng ốc...)"
                value={formContent}
                onChange={(e) => {
                  setFormContent(e.target.value);
                  setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
                required
              />
            </div>

            {/* Optional Media Uploader for Review (min 0, max 10) */}
            <MediaUploader
              images={formImages}
              onChange={setFormImages}
              postType="review"
              minImages={0}
              maxImages={10}
              disabled={formSubmitting}
            />

            {/* Mobile Controls: Star Rating, Subtabs & Action Button */}
            <div className="flex md:hidden flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-secondary shrink-0">Đánh giá:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill={star <= formRating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.116.488-.415.87-.837.614l-4.742-2.884a.563.563 0 00-.576 0l-4.742 2.884c-.422.256-.953-.126-.837-.614l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              <SegmentedControl
                ariaLabel="Review mode"
                fullWidth
                options={SUBTAB_OPTIONS}
                activeKey={subTab}
                onChange={handleSubTabChange}
                className="w-full my-0.5"
              />

              {!user ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold w-full flex items-center justify-center cursor-pointer"
                >
                  Đăng nhập để gửi
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold w-full flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Đang gửi...' : '+ Gửi'}
                </button>
              )}
            </div>

            {/* Desktop Bottom Row: Subtabs, Rating Selector & Dynamic Action Button */}
            <div className="hidden md:flex flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
                <SegmentedControl
                  ariaLabel="Review mode"
                  options={SUBTAB_OPTIONS}
                  activeKey={subTab}
                  onChange={handleSubTabChange}
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary">Đánh giá:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-0.5 text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill={star <= formRating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.116.488-.415.87-.837.614l-4.742-2.884a.563.563 0 00-.576 0l-4.742 2.884c-.422.256-.953-.126-.837-.614l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!user ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer"
                >
                  Đăng nhập để gửi
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Đang gửi...' : '+ Gửi'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <MapPickerToolbar active={shouldShowCompactMapPicker}>
        {subTab === 'post' ? (
          <AddressSelectDropdown
            address={formAddress}
            point={formPoint}
            onChangeAddress={setFormAddress}
            onChangePoint={setFormPoint}
            onToggleMapPicker={toggleLocationPicker}
            isMapPicking={isPickingLocation}
            showMapPickerControls
            onFocusInput={() => setIsPickingLocation(true)}
            onClose={handleCloseLocationPicker}
            placeholder="Địa chỉ"
          />
        ) : (
          <LocationSelectDropdown
            value={locationFilter}
            onChange={(loc) => {
              setLocationFilter(loc);
              locationFilterRef.current = loc;
              const params = new URLSearchParams(searchParams?.toString() || '');
              appendLocationParams(params, loc);
              if (searchQuery.trim()) params.set('q', searchQuery.trim());
              params.set('mode', searchMode);
              replaceHomeSearchParams(params);
            }}
            onToggleMapPicker={toggleLocationPicker}
            isMapPicking={isPickingLocation}
            onFocusInput={() => setIsPickingLocation(true)}
            onClose={handleCloseLocationPicker}
            placeholder="Chọn khu vực (1km)..."
          />
        )}
      </MapPickerToolbar>

      {/* Notices */}
      {!isPickingLocation && (formError || successNotice) && (
        <div className="mt-3 px-1">
          {formError && (
            <div className="text-xs text-red-600 font-semibold px-1">{formError}</div>
          )}
          {successNotice && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 rounded px-2.5 py-1 font-semibold">{successNotice}</div>
          )}
        </div>
      )}

      {/* Mobile View Toggle Buttons */}
      <div
        className={[
          'lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur py-2 -mx-4 px-4 sm:-mx-6 sm:px-6',
          isPickingLocation ? 'hidden' : 'flex',
        ].join(' ')}
      >
        <SegmentedControl
          ariaLabel="Review view"
          fullWidth
          options={[
            {
              key: 'list',
              label:
                subTab === 'post'
                  ? selectedBuildingId
                    ? 'Review đã có'
                    : 'Gần đây'
                  : 'Danh sách',
            },
            { key: 'map', label: 'Bản đồ' },
          ]}
          activeKey={mobileViewMode}
          onChange={(key) => {
            const mode = key as 'list' | 'map';
            setMobileViewMode(mode);
            if (mode === 'map') {
              setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            }
          }}
        />
      </div>

      {/* Main 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 lg:mt-4 min-h-[500px]">
        {/* Left Side: Review Cards Feed + Overlay on Desktop */}
        <div
          ref={leftColRef}
          className="lg:col-span-4 relative flex flex-col lg:h-[850px] lg:max-h-[850px]"
        >
          {/* Feed Cards: scrollable list on desktop */}
          <div
            className={`flex-1 lg:overflow-y-auto pr-1.5 flex flex-col gap-3 ${
              mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div ref={listHeaderRef} className="hidden lg:flex items-center justify-between pb-1">
              {subTab !== 'all' && (
                <span className="text-secondary text-xs font-semibold">
                  {formPoint || selectedBuildingId ? 'Gợi ý' : 'Chưa chọn vị trí'}
                </span>
              )}
              {subTab === 'all' && (
                <>
                  <FeedSelectDropdown
                    label="Review"
                    value={ratingFilter}
                    options={RATING_FILTER_OPTIONS}
                    onChange={handleRatingFilterChange}
                  />
                  <FeedSelectDropdown
                    label="Sắp xếp"
                    value={sortOrder}
                    options={REVIEW_SORT_OPTIONS}
                    onChange={handleSortChange}
                    className="ml-auto"
                    alignMenu="right"
                  />
                </>
              )}
            </div>

            {subTab === 'all' && (
              <div className="lg:hidden flex items-center flex-wrap gap-x-3 gap-y-1.5 pb-1">
                <FeedSelectDropdown
                  label="Review"
                  value={ratingFilter}
                  options={RATING_FILTER_OPTIONS}
                  onChange={handleRatingFilterChange}
                />
                <FeedSelectDropdown
                  label="Sắp xếp"
                  value={sortOrder}
                  options={REVIEW_SORT_OPTIONS}
                  onChange={handleSortChange}
                  className="ml-auto"
                  alignMenu="right"
                />
              </div>
            )}
            {loading ? (
              <div className="py-8 text-center text-secondary text-sm">Đang tải...</div>
            ) : displayedReviews.length === 0 ? (
              subTab === 'post' && !formPoint ? (
                <div className="py-8 text-center text-secondary bg-surface border border-secondary rounded-md text-sm p-4">
                  Nhập địa chỉ hoặc chọn trên bản đồ để xem các tòa nhà gần đó.
                </div>
              ) : subTab === 'post' ? (
                <div className="py-8 text-center text-secondary bg-surface border border-secondary rounded-md text-sm p-4">
                  Không tìm thấy tòa nhà hoặc tin đăng lân cận.
                </div>
              ) : subTab === 'all' && !locationFilter ? (
                <div className="py-8 text-center bg-surface border border-secondary rounded-md p-6 flex flex-col items-center gap-3">
                  <div className="font-bold text-sm text-primary">Chưa chọn khu vực xem review</div>
                  <p className="text-secondary text-xs max-w-sm">
                    Chọn một khu vực trên bản đồ (bán kính 1km) hoặc tìm tên địa danh để xem các đánh giá phòng trọ xung quanh.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPickingLocation(true);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setMobileViewMode('map');
                      }
                    }}
                    className="btn-primary text-xs font-bold px-4 py-2 cursor-pointer"
                  >
                    Chọn khu vực trên bản đồ (1km)
                  </button>
                </div>
              ) : subTab === 'all' && locationFilter ? (
                <div className="py-8 text-center bg-surface border border-secondary rounded-md p-5 flex flex-col items-center gap-3">
                  <p className="text-secondary text-sm font-medium">
                    Chưa có ghi nhận review nào trong bán kính 1km quanh "{locationFilter.label || 'khu vực đã chọn'}".
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="btn-secondary text-xs font-bold px-4 py-2 cursor-pointer"
                  >
                    Chọn khu vực khác
                  </button>
                </div>
              ) : subTab === 'search' && !searchQuery.trim() ? (
                <div className="py-8 text-center bg-surface border border-secondary rounded-md p-6 flex flex-col items-center gap-3">
                  <div className="font-bold text-sm text-primary">Tra cứu & Xác minh danh tính</div>
                  <p className="text-secondary text-xs max-w-sm">
                    Nhập Số điện thoại chủ trọ/môi giới, Địa chỉ cụ thể hoặc Tên chuỗi vận hành ở thanh tìm kiếm để kiểm tra lịch sử bẫy cọc và cảnh báo.
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center bg-surface border border-secondary rounded-md p-5 flex flex-col items-center gap-3">
                  <p className="text-secondary text-sm font-medium">
                    {searchMode === 'phone'
                      ? `Chưa có ghi nhận review nào cho SĐT "${searchQuery}".`
                      : searchMode === 'address'
                      ? `Chưa có ghi nhận review nào tại địa chỉ "${searchQuery}".`
                      : `Chưa có ghi nhận review nào cho thương hiệu / chủ "${searchQuery}".`}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="btn-secondary text-xs font-bold px-4 py-2 cursor-pointer"
                  >
                    Xóa tra cứu
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {displayedReviews.slice(0, visibleCount).map((post) => {
                  const placeId =
                    post.building_id || (post as any).buildings?.nmb_id || post.house_id || null;
                  if (subTab === 'post' && post.post_type !== 'review') {
                    return (
                      <ListingCard
                        key={post.id}
                        listing={post as any}
                        showDistance
                        lineClamp={3}
                        onMouseEnter={() => setHoveredReviewId(post.id)}
                        onMouseLeave={() => setHoveredReviewId(null)}
                        onSelect={(id?: string) => handleSelectBuilding(id || placeId || null, post.short_id || post.id)}
                      />
                    );
                  }
                  return (
                    <ReviewCard
                      key={post.id}
                      review={post}
                      linkToHouse={true}
                      lineClamp={4}
                      onMouseEnter={() => setHoveredReviewId(post.id)}
                      onMouseLeave={() => setHoveredReviewId(null)}
                      onSelect={(id?: string) => handleSelectBuilding(id || placeId || null, post.short_id || post.id)}
                    />
                  );
                })}
                {visibleCount < displayedReviews.length && (
                  <div ref={sentinelRef} className="py-2 text-center text-xs text-secondary">
                    Đang tải...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Building Detail BottomSheet Overlay: overlays list view column on desktop, fixed bottom on mobile */}
          {(selectedBuildingId || selectedPostId) && (
            <BottomSheet
              containerRef={leftColRef}
              topAnchorRef={listHeaderRef}
              snapState={snapState}
              onSnapChange={(newSnap) => {
                setSnapState(newSnap);
                trackViewModeToggled({
                  tab: 'review',
                  mode: 'split_view',
                  sheet_state: newSnap,
                });
              }}
              peekHeight={210}
              showHandle={false}
            >
              <BuildingDetailPane
                elasticId={selectedBuildingId || undefined}
                postId={selectedPostId || undefined}
                initialTab="reviews"
                highlightPostId={selectedPostId || undefined}
                onRequestWriteReview={handleRequestWriteReview}
                onClose={() => handleSelectBuilding(null)}
                className="pb-10"
              />
            </BottomSheet>
          )}
        </div>

        {/* Right Side: Interactive Map (2/3 width on desktop) */}
        <div className={`lg:col-span-8 relative ${mobileViewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div
            data-testid="search-map-view"
            className="lg:sticky lg:top-20 h-[calc(100dvh-112px)] min-h-[calc(100dvh-112px)] lg:h-[850px] lg:min-h-0 w-full rounded-md overflow-hidden border border-secondary relative"
          >
            {subTab === 'all' && !loading && !isPickingLocation && !locationFilter && (
              <div className="absolute top-4 left-4 right-4 z-[500] bg-surface/95 backdrop-blur border border-secondary rounded-md p-4 shadow-md max-w-sm">
                <div className="font-bold text-xs text-primary mb-1">Chưa chọn khu vực xem review</div>
                <p className="text-secondary text-xs mb-3">
                  Bấm chọn một điểm trên bản đồ để xem các đánh giá và cảnh báo trong bán kính 1km.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPickingLocation(true);
                  }}
                  className="btn-primary text-xs font-bold px-3 py-1.5 w-full cursor-pointer"
                >
                  Bật chế độ chọn điểm trên bản đồ
                </button>
              </div>
            )}
            {subTab === 'search' && !loading && !searchQuery.trim() && (
              <div className="absolute top-4 left-4 right-4 z-[500] bg-surface/95 backdrop-blur border border-secondary rounded-md p-4 shadow-md max-w-sm">
                <div className="font-bold text-xs text-primary mb-1">Tra cứu & Xác minh danh tính</div>
                <p className="text-secondary text-xs">
                  Nhập Số điện thoại, Địa chỉ hoặc Tên chuỗi ở thanh tìm kiếm để tra cứu lịch sử bẫy cọc.
                </p>
              </div>
            )}
            {subTab === 'all' && !loading && !isPickingLocation && displayedReviews.length === 0 && locationFilter && (
              <ZeroStateRecoveryBox
                variant="map-overlay"
                hasLocationRadius={false}
                hasPriceFilter={false}
                onResetAll={handleResetAll}
              />
            )}
            {(() => {
              const activeLoc = locationFilter;
              const activePoint =
                subTab === 'post'
                  ? formPoint || undefined
                  : subTab === 'all' && activeLoc?.type === 'radius' && activeLoc.lat && activeLoc.lng
                  ? { lat: activeLoc.lat, lng: activeLoc.lng }
                  : undefined;
              const activeRadius = subTab === 'post' ? undefined : 1000;
              const activePickingMode = subTab === 'post' ? 'point' : 'radius';

              return (
                <InteractiveMap
                  activeCity={currentCity}
                  reviewPins={displayedPins}
                  height="100%"
                  isPickingLocation={isPickingLocation}
                  pickingMode={activePickingMode}
                  selectedBuildingId={selectedBuildingId}
                  selectedPostId={selectedPostId}
                  onSelectBuilding={(id, rId) => handleSelectBuilding(id, rId)}
                  selectedPoint={activePoint}
                  selectedRadiusM={activeRadius}
                  onPointSelect={handlePointSelect}
                  onClosePicker={handleCloseLocationPicker}
                  hoveredPinId={hoveredReviewId}
                />
              );
            })()}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
