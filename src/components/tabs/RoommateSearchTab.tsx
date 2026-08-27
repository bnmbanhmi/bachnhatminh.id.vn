'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import LocationPicker from '@/components/LocationPicker';
import { sanitizeErrorMessage } from '@/lib/utils/error-sanitizer';
import {
  HANOI_UNITS,
  appendLocationParams,
  locationFromSearchParams,
  matchesLocationSelection,
  createWardSelection,
  parseWardCodesFromText,
  distanceMeters,
  getWardCoordinatesByCode,
  CityCode,
  resolveEntityCity,
  DEFAULT_HANOI_CENTER,
  DEFAULT_HCMC_CENTER,
  type LocationSelection,
} from '@/lib/location';
import { useCityState } from '@/lib/city-state';
import { parseVndInput, handleHoverMarqueeEnter, handleHoverMarqueeLeave, parseKeywords, matchesKeywords } from '@/lib/search';
import RoommateCard from '@/components/RoommateCard';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';
import MapPickerToolbar from '@/components/ui/MapPickerToolbar';
import RoommateDetailPane from '@/components/RoommateDetailPane';
import BuildingDetailPane from '@/components/BuildingDetailPane';
import BottomSheet, { SnapState } from '@/components/ui/BottomSheet';
import LocationSelectDropdown from '@/components/ui/LocationSelectDropdown';
import AddressSelectDropdown from '@/components/ui/AddressSelectDropdown';
import GenderSelectDropdown, { GenderOption } from '@/components/ui/GenderSelectDropdown';
import DateSelectDropdown from '@/components/ui/DateSelectDropdown';
import DynamicSuggestionChips, { type ChipCategory } from '@/components/ui/DynamicSuggestionChips';
import ContactField from '@/components/ui/ContactField';
import { getUserContact, saveUserContact } from '@/lib/contact';
import type { MapRoommatePin } from '@/components/InteractiveMap';
import { pushHomeSearchParams, replaceHomeSearchParams } from '@/lib/home-url-state';
import {
  applyFeedSort,
  isFeedSortOrder,
  toTimestamp,
  FEED_SORT_OPTIONS,
  type FeedSortOrder,
} from '@/lib/sorting';
import { useGeoAnchor } from '@/hooks/useGeoAnchor';
import FeedSelectDropdown from '@/components/ui/FeedSelectDropdown';
import ZeroStateRecoveryBox from '@/components/ui/ZeroStateRecoveryBox';
import {
  DateFilterOption,
  DATE_FILTER_OPTIONS,
  DEFAULT_DATE_FILTER,
  isDateFilterOption,
  resolveDateFilter,
  matchesDateFilter,
} from '@/lib/dates';
import {
  trackSearch,
  trackBuildingInspect,
  trackFormStep,
  trackFilterApplied,
  trackViewModeToggled,
} from '@/lib/telemetry';

const ROOM_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'has', label: 'Đã có' },
  { value: 'none', label: 'Chưa có' },
];

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 flex items-center justify-center border border-secondary text-secondary rounded-sm font-semibold text-sm">
      Đang tải...
    </div>
  ),
});

export interface Profile {
  id: string;
  short_id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  contact_info?: string | null;
  avatar_url?: string | null;
  is_seeking_roommate: boolean;
  budget_min: number | null;
  budget_max: number | null;
  gender_pref: string | null;
  desired_ward: string | null;
  desired_location_type?: 'ward' | 'radius' | null;
  desired_ward_codes?: string[] | null;
  desired_lat?: number | null;
  desired_lng?: number | null;
  desired_radius_m?: number | null;
  building_id?: string | null;
  address_raw?: string | null;
  room_state?: string | null;
  price?: number | null;
  price_unit?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at?: string | null;
  status?: string | null;
  post_type?: string | null;
  source_type?: string | null;
  source_url?: string | null;
}

export interface RoommateSearchTabProps {
  className?: string;
  initialType?: 'listings' | 'profiles';
  showSearchBar?: boolean;
  activeCity?: CityCode;
  mobileViewMode?: 'list' | 'map';
  onMobileViewModeChange?: (mode: 'list' | 'map') => void;
}

function matchesProfileLocation(
  filter: LocationSelection | null,
  profile: Profile
): boolean {
  if (!filter) return true;

  // 1. Candidate has radius location
  if (profile.desired_location_type === 'radius' && profile.desired_lat && profile.desired_lng) {
    const candidatePoint = { lat: profile.desired_lat, lng: profile.desired_lng };
    if (filter.type === 'radius') {
      const dist = distanceMeters(filter, candidatePoint);
      return dist <= (filter.radiusM + (profile.desired_radius_m || 1000));
    } else {
      const filterCodes = filter.wardCodes && filter.wardCodes.length > 0 ? filter.wardCodes : [filter.wardCode];
      return filterCodes.some((code) => {
        const wardCoords = getWardCoordinatesByCode(code);
        if (!wardCoords) return false;
        return distanceMeters(wardCoords, candidatePoint) <= (profile.desired_radius_m || 1000) + 1500;
      });
    }
  }

  // 2. Candidate has multi-ward codes
  if (profile.desired_ward_codes && profile.desired_ward_codes.length > 0) {
    if (filter.type === 'ward') {
      const filterCodes = (filter.wardCodes && filter.wardCodes.length > 0 ? filter.wardCodes : [filter.wardCode]).map((c) => c.toUpperCase());
      return profile.desired_ward_codes.some((c) => filterCodes.includes(c.toUpperCase()));
    } else {
      return profile.desired_ward_codes.some((code) => {
        const wardCoords = getWardCoordinatesByCode(code);
        if (!wardCoords) return false;
        return distanceMeters(filter, wardCoords) <= filter.radiusM;
      });
    }
  }

  // 3. Fallback to desired_ward text
  return matchesLocationSelection(
    filter,
    null,
    null,
    profile.desired_ward
  );
}

function matchesProfilePrice(p: Profile, parsedMin: number | null, parsedMax: number | null): boolean {
  if (parsedMin === null && parsedMax === null) return true;
  const price = p.price && p.price > 0 ? p.price : null;
  const effectiveMin = price ?? p.budget_min ?? (p.budget_max !== null && p.budget_max !== undefined ? 0 : null);
  const effectiveMax = price ?? p.budget_max ?? p.budget_min ?? null;

  if (effectiveMin === null && effectiveMax === null) return false;

  if (parsedMin !== null && (effectiveMax === null || effectiveMax < parsedMin)) {
    return false;
  }
  if (parsedMax !== null && (effectiveMin === null || effectiveMin > parsedMax)) {
    return false;
  }
  return true;
}

const SUBTAB_OPTIONS: SegmentedOption[] = [
  { key: 'find', label: 'Tin đăng' },
  { key: 'post', label: 'Đăng tin' },
];

const GENDER_FILTER_OPTIONS: GenderOption[] = [
  { value: 'any', label: 'Giới tính' },
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
];

const GENDER_PREF_OPTIONS: GenderOption[] = [
  { value: 'any', label: 'Bất kỳ (Nam/Nữ)' },
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
];

const VISIBILITY_OPTIONS: GenderOption[] = [
  { value: 'active', label: 'Công khai' },
  { value: 'inactive', label: 'Tạm ẩn' },
];

export default function RoommateSearchTab({
  className = '',
  initialType,
  showSearchBar = true,
  activeCity,
  mobileViewMode: propMobileViewMode,
  onMobileViewModeChange,
}: RoommateSearchTabProps) {
  const searchParams = useSearchParams();
  const { activeCity: hookCity } = useCityState();
  const currentCity = activeCity || hookCity;
  const searchParamsKey = searchParams.toString();

  const initialLocation = useMemo(
    () => locationFromSearchParams(new URLSearchParams(searchParamsKey)),
    [searchParamsKey]
  );
  const initialKeyword = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || '';
  const roomParam = searchParams.get('room') || '';
  const subTabParam = searchParams.get('subtab') === 'post' ? 'post' : 'find';

  const supabase = createClient();

  // Sub-tab State
  const [subTab, setSubTab] = useState<'find' | 'post'>(subTabParam);

  // Sort state
  const [sortOrder, setSortOrder] = useState<FeedSortOrder>(
    isFeedSortOrder(sortParam) ? sortParam : 'newest'
  );

  // Room state filter
  const [roomFilter, setRoomFilter] = useState<'all' | 'has' | 'none'>(
    roomParam === 'has' || roomParam === 'none' ? roomParam : 'all'
  );

  // Search/Filter State: Staged vs Draft
  const [locationFilter, setLocationFilter] = useState<LocationSelection | null>(initialLocation);
  const locationFilterRef = useRef<LocationSelection | null>(initialLocation);
  useEffect(() => {
    locationFilterRef.current = locationFilter;
  }, [locationFilter]);

  const [appliedKeyword, setAppliedKeyword] = useState(initialKeyword);
  const [draftKeyword, setDraftKeyword] = useState(initialKeyword);

  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || searchParams.get('max_price_per_person') || '';
  const initialGender = searchParams.get('gender') || 'any';

  const [appliedBudgetMin, setAppliedBudgetMin] = useState(initialMinPrice);
  const [draftBudgetMin, setDraftBudgetMin] = useState(initialMinPrice);

  const [appliedBudgetMax, setAppliedBudgetMax] = useState(initialMaxPrice);
  const [draftBudgetMax, setDraftBudgetMax] = useState(initialMaxPrice);

  const [appliedGender, setAppliedGender] = useState(initialGender);
  const [draftGender, setDraftGender] = useState(initialGender);

  const dateParam = searchParams.get('date');
  const [appliedDateFilter, setAppliedDateFilter] = useState<DateFilterOption>(
    resolveDateFilter(dateParam)
  );
  const [draftDateFilter, setDraftDateFilter] = useState<DateFilterOption>(
    resolveDateFilter(dateParam)
  );

  const [priceError, setPriceError] = useState('');
  const [snapState, setSnapState] = useState<SnapState>('peek');
  const [internalMobileViewMode, setInternalMobileViewMode] = useState<'list' | 'map'>('list');
  const mobileViewMode = propMobileViewMode ?? internalMobileViewMode;
  const setMobileViewMode = useCallback(
    (mode: 'list' | 'map') => {
      setInternalMobileViewMode(mode);
      onMobileViewModeChange?.(mode);
      trackViewModeToggled({
        tab: 'roommate',
        mode: mode === 'map' ? 'map_view' : 'list_view',
        sheet_state: snapState,
      });
    },
    [onMobileViewModeChange, snapState]
  );
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // 500ms Debounced auto-swap on draft price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsedMin = parseVndInput(draftBudgetMin);
      const parsedMax = parseVndInput(draftBudgetMax);
      if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
        setDraftBudgetMin(draftBudgetMax);
        setDraftBudgetMax(draftBudgetMin);
        setPriceError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [draftBudgetMin, draftBudgetMax]);

  const handlePriceBlur = () => {
    const parsedMin = parseVndInput(draftBudgetMin);
    const parsedMax = parseVndInput(draftBudgetMax);
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      setDraftBudgetMin(draftBudgetMax);
      setDraftBudgetMax(draftBudgetMin);
      setPriceError('');
    }
  };

  // Post/Edit Profile Form State (Inline in tab)
  const [formWard, setFormWard] = useState('');
  const [formLocationFilter, setFormLocationFilter] = useState<LocationSelection | null>(null);
  const [formPrice, setFormPrice] = useState('3tr');
  const [formGenderPref, setFormGenderPref] = useState('any');
  const [formContact, setFormContact] = useState('');
  const [saveFormContactForLater, setSaveFormContactForLater] = useState(false);
  const [formBio, setFormBio] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const profileParam = searchParams.get('profile') || searchParams.get('id') || null;
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(profileParam);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildingTargetPostId, setBuildingTargetPostId] = useState<string | null>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const listHeaderRef = useRef<HTMLDivElement>(null);

  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  // Raw Data State
  const [rawProfiles, setRawProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Pagination / Lazy feed rendering
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(20);
  }, [appliedKeyword, locationFilter, appliedGender, appliedBudgetMin, appliedBudgetMax, sortOrder, roomFilter, appliedDateFilter, subTab]);

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

  const [activeFocus, setActiveFocus] = useState<ChipCategory>('default');

  useEffect(() => {
    setSubTab(subTabParam);
  }, [subTabParam]);

  useEffect(() => {
    setSortOrder(isFeedSortOrder(sortParam) ? sortParam : 'newest');
  }, [sortParam]);

  useEffect(() => {
    setRoomFilter(roomParam === 'has' || roomParam === 'none' ? roomParam : 'all');
  }, [roomParam]);

  useEffect(() => {
    const nextDate = resolveDateFilter(dateParam);
    setAppliedDateFilter(nextDate);
    setDraftDateFilter(nextDate);
  }, [dateParam]);

  useEffect(() => {
    setLocationFilter(initialLocation);
    setAppliedKeyword(initialKeyword);
    setDraftKeyword(initialKeyword);
    setAppliedBudgetMin(initialMinPrice);
    setDraftBudgetMin(initialMinPrice);
    setAppliedBudgetMax(initialMaxPrice);
    setDraftBudgetMax(initialMaxPrice);
    setAppliedGender(initialGender);
    setDraftGender(initialGender);
  }, [initialLocation, initialKeyword, initialMinPrice, initialMaxPrice, initialGender]);

  useEffect(() => {
    if (isPickingLocation) {
      setActiveFocus('location');
    }
  }, [isPickingLocation]);

  // Fetch logged in user
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

  // Fetch my roommate post from public.posts (post_type='roommate')
  useEffect(() => {
    async function fetchMyProfile() {
      if (!user) {
        setMyProfile(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_type', 'roommate')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setMyProfile({
            ...(data as any),
            budget_min: (data as any).extracted_data?.budget_min ?? null,
            budget_max: (data as any).extracted_data?.budget_max ?? null,
            gender_pref: (data as any).extracted_data?.gender_preference ?? 'any',
            desired_ward: (data as any).extracted_data?.desired_ward ?? null,
            desired_location_type: (data as any).extracted_data?.desired_location_type ?? null,
            desired_ward_codes: (data as any).extracted_data?.desired_ward_codes ?? null,
            desired_lat: (data as any).extracted_data?.desired_lat ?? null,
            desired_lng: (data as any).extracted_data?.desired_lng ?? null,
            desired_radius_m: (data as any).extracted_data?.desired_radius_m ?? null,
            contact_info: (data as any).contact_info ?? null,
            bio: (data as any).content ?? null,
            building_id: (data as any).building_id ?? null,
            address_raw: (data as any).extracted_data?.address_raw ?? null,
            room_state: (data as any).extracted_data?.room_state ?? null,
            price: (data as any).price ?? null,
            price_unit: (data as any).extracted_data?.price_unit ?? null,
            is_seeking_roommate: (data as any).status === 'approved',
            status: (data as any).status,
          } as Profile);
        } else {
          setMyProfile(null);
        }
      } catch (err) {
        console.error('Error fetching my roommate post:', err);
      }
    }
    fetchMyProfile();
  }, [user, supabase]);

  // Sync profile data into form when myProfile is loaded
  useEffect(() => {
    if (myProfile) {
      // 1. Direct radius coordinates from DB
      if (myProfile.desired_location_type === 'radius' && myProfile.desired_lat && myProfile.desired_lng) {
        setFormLocationFilter({
          type: 'radius',
          lat: myProfile.desired_lat,
          lng: myProfile.desired_lng,
          radiusM: myProfile.desired_radius_m || 1000,
          label: 'Khu vực đã chọn',
        });
        setFormWard('Khu vực đã chọn');
      }
      // 2. Direct ward codes from DB
      else if (myProfile.desired_ward_codes && myProfile.desired_ward_codes.length > 0) {
        const selection = createWardSelection(myProfile.desired_ward_codes);
        setFormLocationFilter(selection);
        setFormWard(selection?.label || myProfile.desired_ward || '');
      }
      // 3. Fallback to parsing desired_ward string
      else if (myProfile.desired_ward) {
        const desiredWard = myProfile.desired_ward;
        const radiusMatch = desiredWard.match(/\[radius:([\d\.\-]+),([\d\.\-]+),(\d+)\]/);
        if (radiusMatch) {
          const lat = parseFloat(radiusMatch[1]);
          const lng = parseFloat(radiusMatch[2]);
          const radiusM = parseInt(radiusMatch[3], 10);
          setFormLocationFilter({
            type: 'radius',
            lat,
            lng,
            radiusM,
            label: 'Khu vực đã chọn',
          });
          setFormWard('Khu vực đã chọn');
        } else {
          const parsedCodes = parseWardCodesFromText(desiredWard);
          if (parsedCodes.length > 0) {
            const selection = createWardSelection(parsedCodes);
            setFormLocationFilter(selection);
            setFormWard(selection?.label || desiredWard);
          } else if (desiredWard.includes('Khu vực đã chọn')) {
            setFormLocationFilter({
              type: 'radius',
              lat: 21.028511,
              lng: 105.804817,
              radiusM: 1000,
              label: 'Khu vực đã chọn',
            });
            setFormWard('Khu vực đã chọn');
          } else {
            setFormLocationFilter(null);
            setFormWard(desiredWard);
          }
        }
      } else {
        setFormLocationFilter(null);
        setFormWard('');
      }

      const priceVal = myProfile.price ?? myProfile.budget_max ?? myProfile.budget_min ?? null;
      setFormPrice(
        priceVal !== null && priceVal !== undefined
          ? priceVal >= 1000000
            ? `${priceVal / 1000000}tr`
            : String(priceVal)
          : '3tr'
      );
      setFormGenderPref(myProfile.gender_pref || 'any');
      setFormBio(myProfile.bio || '');
      setFormContact((prev) => myProfile.contact_info || prev);
      setFormStatus(myProfile.is_seeking_roommate ? 'active' : 'inactive');
    }
  }, [myProfile]);

  const handleSelectProfile = (profileId: string | null) => {
    setSelectedProfileId(profileId);
    setSelectedBuildingId(null);
    setBuildingTargetPostId(null);
    let resolvedParam = profileId;
    let targetBuildingId: string | null = null;
    let targetPostId: string | null = null;

    if (profileId) {
      const profile = rawProfiles.find((p) => p.id === profileId || (p.short_id && p.short_id === profileId));
      if (profile) {
        resolvedParam = profile.short_id || profile.id;
        if (profile.building_id) {
          targetBuildingId = profile.building_id;
          targetPostId = profile.short_id || profile.id;
          setSelectedBuildingId(targetBuildingId);
          setBuildingTargetPostId(targetPostId);
        }
      }
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (resolvedParam) {
        trackBuildingInspect(resolvedParam, 'roommate', 'roommate');
        setSnapState('peek');
        params.set('profile', resolvedParam);
        params.delete('id');
        if (targetBuildingId) {
          params.set('building', targetBuildingId);
          if (targetPostId) params.set('post', targetPostId);
        } else {
          params.delete('building');
          params.delete('post');
        }
        replaceHomeSearchParams(params);
      } else {
        params.delete('profile');
        params.delete('id');
        params.delete('building');
        params.delete('post');
        replaceHomeSearchParams(params);
      }
    }
  };

  // Deep-link routing: a profile URL param pointing at a building-backed roommate
  // post opens the building pane scrolled to that post instead of the standalone profile.
  useEffect(() => {
    if (!selectedProfileId) return;
    const profile = rawProfiles.find((p) => p.id === selectedProfileId || (p.short_id && p.short_id === selectedProfileId));
    if (profile?.building_id) {
      setSelectedBuildingId(profile.building_id);
      setBuildingTargetPostId(profile.short_id || profile.id);
    } else if (profile && !profile.building_id) {
      setSelectedBuildingId(null);
      setBuildingTargetPostId(null);
    }
  }, [selectedProfileId, rawProfiles]);

  const handleCloseLocationPicker = () => {
    setIsPickingLocation(false);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileViewMode('list');
    }
    if (subTab === 'find') {
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
      setFormLocationFilter((prev) => {
        const next: LocationSelection = {
          type: 'radius',
          lat: point.lat,
          lng: point.lng,
          radiusM: (prev?.type === 'radius' && prev.radiusM) || 1000,
          label: (prev?.type === 'radius' && prev.label) || 'Khu vực đã chọn',
          wardCode: prev?.type === 'radius' ? prev.wardCode : undefined,
        };
        setFormWard(next.label);
        return next;
      });
    } else {
      setLocationFilter((prev) => {
        const updated: LocationSelection = {
          type: 'radius',
          lat: point.lat,
          lng: point.lng,
          radiusM: (prev?.type === 'radius' && prev.radiusM) || 1000,
          label: (prev?.type === 'radius' && prev.label) || 'Khu vực đã chọn',
          wardCode: prev?.type === 'radius' ? prev.wardCode : undefined,
        };
        locationFilterRef.current = updated;
        return updated;
      });
    }
  };


  const handleRadiusSelect = (radiusM: number) => {
    if (subTab === 'post') {
      setFormLocationFilter((prev) => {
        const next: LocationSelection = {
          type: 'radius',
          lat: (prev?.type === 'radius' && prev.lat) || 21.028511,
          lng: (prev?.type === 'radius' && prev.lng) || 105.804817,
          radiusM,
          label: (prev?.type === 'radius' && prev.label) || 'Khu vực đã chọn',
          wardCode: prev?.type === 'radius' ? prev.wardCode : undefined,
        };
        setFormWard(next.label);
        return next;
      });
    } else {
      setLocationFilter((prev) => {
        const updated: LocationSelection = {
          type: 'radius',
          lat: (prev?.type === 'radius' && prev.lat) || 21.028511,
          lng: (prev?.type === 'radius' && prev.lng) || 105.804817,
          radiusM,
          label: (prev?.type === 'radius' && prev.label) || 'Khu vực đã chọn',
          wardCode: prev?.type === 'radius' ? prev.wardCode : undefined,
        };
        locationFilterRef.current = updated;
        return updated;
      });
    }
  };

  // Subtab switcher handler
  const handleSubTabChange = (key: string) => {
    const newTab = key as 'find' | 'post';
    setSubTab(newTab);
    setPriceError('');
    setFormError('');
    setSuccessNotice('');
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'roommate');
    params.delete('type');
    if (newTab === 'post') {
      params.set('subtab', 'post');
    } else {
      params.delete('subtab');
    }
    pushHomeSearchParams(params);
  };

  // Fetch all active roommate posts from roommate_posts_public (post_type='roommate', status='approved')
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roommate_posts_public')
        .select('*')
        .eq('is_seeking_roommate', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const raw = (data as Profile[]) || [];
      setRawProfiles(raw);
    } catch (err) {
      console.error('Error fetching roommate posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // City Filtered Profiles
  const cityFilteredRawProfiles = useMemo(() => {
    return rawProfiles.filter((p) => resolveEntityCity(p as any) === currentCity);
  }, [rawProfiles, currentCity]);

  // Filter profiles for Tìm người mode
  const searchProfiles = useMemo(() => {
    let list = cityFilteredRawProfiles;

    if (locationFilter) {
      list = list.filter((profile) => matchesProfileLocation(locationFilter, profile));
    }

    const parsedMin = parseVndInput(appliedBudgetMin);
    const parsedMax = parseVndInput(appliedBudgetMax);

    if (parsedMin !== null || parsedMax !== null) {
      list = list.filter((p) => matchesProfilePrice(p, parsedMin, parsedMax));
    }

    if (appliedGender !== 'any') {
      list = list.filter((p) => p.gender_pref === appliedGender);
    }

    if (appliedKeyword.trim()) {
      const keywords = parseKeywords(appliedKeyword);
      list = list.filter((p) =>
        matchesKeywords(keywords, [
          p.desired_ward,
          p.bio,
          p.full_name,
        ])
      );
    }

    if (appliedDateFilter !== 'all') {
      list = list.filter((p) =>
        matchesDateFilter((p as any).published_at || p.created_at, appliedDateFilter)
      );
    }

    return list;
  }, [cityFilteredRawProfiles, locationFilter, appliedBudgetMin, appliedBudgetMax, appliedGender, appliedKeyword, appliedDateFilter]);

  useEffect(() => {
    if (!loading) {
      const roommateWardCodes = locationFilter
        ? (locationFilter.type === 'ward' ? (locationFilter.wardCodes || [locationFilter.wardCode]) : (locationFilter.wardCode ? [locationFilter.wardCode] : []))
        : [];
      trackSearch({
        tab: 'roommate',
        ward_codes: roommateWardCodes,
        budget_min: parseVndInput(appliedBudgetMin),
        budget_max: parseVndInput(appliedBudgetMax),
        result_count: searchProfiles.length,
        utm_source: searchParams?.get('utm_source') || undefined,
        utm_campaign: searchParams?.get('utm_campaign') || undefined,
      });
    }
  }, [locationFilter, appliedBudgetMin, appliedBudgetMax, searchProfiles.length, loading, searchParams]);

  // Suggested matching profiles for Đăng tin mode
  const suggestedProfiles = useMemo(() => {
    // Exclude current user from suggestions
    let list = cityFilteredRawProfiles.filter((p) => !user || p.id !== user.id);

    // 1. Location matching (multi-ward / radius)
    if (formLocationFilter) {
      list = list.filter((profile) => matchesProfileLocation(formLocationFilter, profile));
    } else if (formWard.trim()) {
      const wardLower = formWard.trim().toLowerCase();
      list = list.filter((profile) => {
        if (!profile.desired_ward) return false;
        const pWardLower = profile.desired_ward.toLowerCase();
        return pWardLower.includes(wardLower) || wardLower.includes(pWardLower);
      });
    }

    // 2. Budget matching
    const parsedFormPrice = parseVndInput(formPrice);
    if (parsedFormPrice !== null) {
      list = list.filter((p) => matchesProfilePrice(p, null, parsedFormPrice));
    }

    // 3. Gender preference matching
    if (formGenderPref === 'male') {
      list = list.filter((p) => p.gender_pref === 'male' || p.gender_pref === 'any');
    } else if (formGenderPref === 'female') {
      list = list.filter((p) => p.gender_pref === 'female' || p.gender_pref === 'any');
    }

    return list;
  }, [cityFilteredRawProfiles, user, formLocationFilter, formWard, formPrice, formGenderPref]);

  // Sort anchor for "Gần nhất" (active location selection, else device GPS)
  const geoAnchor = useGeoAnchor(
    locationFilter,
    subTab !== 'post' && sortOrder === 'closest'
  );

  const handleSortChange = (order: FeedSortOrder) => {
    setSortOrder(order);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', order);
    replaceHomeSearchParams(params);
  };

  const handleRoomFilterChange = (value: string) => {
    const next = value === 'has' || value === 'none' ? value : 'all';
    setRoomFilter(next);
    trackFilterApplied({
      tab: 'roommate',
      filter_name: 'room_filter',
      filter_value: next,
      new_result_count: searchProfiles.length,
      is_zero_result: searchProfiles.length === 0,
    });
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') {
      params.delete('room');
    } else {
      params.set('room', next);
    }
    replaceHomeSearchParams(params);
  };

  // Sorted browse feed (find mode only; post mode keeps its matching flow)
  const sortedProfiles = useMemo(() => {
    if (subTab === 'post') return searchProfiles;
    let list = searchProfiles;
    if (roomFilter === 'has') {
      list = list.filter((p) => !!p.building_id);
    } else if (roomFilter === 'none') {
      list = list.filter((p) => !p.building_id);
    }
    return applyFeedSort(list, sortOrder, (p) => {
      const price = p.price && p.price > 0 ? p.price : null;
      const min = price ?? p.budget_min;
      const max = price ?? p.budget_max;
      const hasCoords =
        p.desired_lat !== null &&
        p.desired_lat !== undefined &&
        p.desired_lng !== null &&
        p.desired_lng !== undefined;
      return {
        priceLow: min ?? (max && max > 0 ? 0 : null),
        priceHigh: max,
        date: toTimestamp(p.created_at || p.updated_at),
        distance:
          hasCoords && geoAnchor
            ? distanceMeters(geoAnchor, { lat: p.desired_lat!, lng: p.desired_lng! })
            : null,
      };
    });
  }, [searchProfiles, subTab, sortOrder, roomFilter, geoAnchor]);

  const currentProfiles = subTab === 'post' ? suggestedProfiles : sortedProfiles;

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
  }, [currentProfiles.length, visibleCount]);

  const commitSearch = (overrides?: {
    location?: LocationSelection | null;
    keyword?: string;
    minPrice?: string;
    maxPrice?: string;
    gender?: string;
    date?: DateFilterOption;
  }) => {
    setPriceError('');
    const targetLoc = overrides && 'location' in overrides ? overrides.location! : locationFilter;
    const targetKw = overrides?.keyword !== undefined ? overrides.keyword : draftKeyword;
    let targetMin = overrides?.minPrice !== undefined ? overrides.minPrice : draftBudgetMin;
    let targetMax = overrides?.maxPrice !== undefined ? overrides.maxPrice : draftBudgetMax;
    const targetGender = overrides?.gender !== undefined ? overrides.gender : draftGender;
    const targetDate = overrides?.date !== undefined ? overrides.date : draftDateFilter;

    const parsedMin = parseVndInput(targetMin);
    const parsedMax = parseVndInput(targetMax);

    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      const temp = targetMin;
      targetMin = targetMax;
      targetMax = temp;
      setDraftBudgetMin(targetMin);
      setDraftBudgetMax(targetMax);
    }

    setAppliedKeyword(targetKw);
    setAppliedBudgetMin(targetMin);
    setAppliedBudgetMax(targetMax);
    setAppliedGender(targetGender);
    setAppliedDateFilter(targetDate);
    setDraftDateFilter(targetDate);
    setLocationFilter(targetLoc);
    locationFilterRef.current = targetLoc;

    const finalParsedMin = parseVndInput(targetMin);
    const finalParsedMax = parseVndInput(targetMax);

    trackFilterApplied({
      tab: 'roommate',
      filter_name: 'search_filters',
      filter_value: {
        location: targetLoc?.label || null,
        keyword: targetKw,
        min_price: finalParsedMin,
        max_price: finalParsedMax,
        gender: targetGender,
        date: targetDate,
      },
      previous_result_count: rawProfiles.length,
      new_result_count: rawProfiles.length,
      is_zero_result: searchProfiles.length === 0,
    });

    const params = new URLSearchParams();
    params.set('tab', 'roommate');
    appendLocationParams(params, targetLoc);
    if (targetKw.trim()) params.set('q', targetKw.trim());
    if (targetGender !== 'any') params.set('gender', targetGender);
    if (targetDate !== DEFAULT_DATE_FILTER) params.set('date', targetDate);
    if (finalParsedMin !== null) params.set('min_price', String(finalParsedMin));
    if (finalParsedMax !== null) params.set('max_price', String(finalParsedMax));
    if (sortOrder !== 'newest') params.set('sort', sortOrder);
    if (roomFilter !== 'all') params.set('room', roomFilter);
    pushHomeSearchParams(params);
  };

  // Submit search filter
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    commitSearch();
  };

  const handleExpandRadius = () => {
    const current = locationFilter;
    let nextLocation: LocationSelection;
    if (current?.type === 'radius') {
      nextLocation = {
        ...current,
        radiusM: current.radiusM + 1000,
      };
    } else if (current?.type === 'ward') {
      const wardCoords = getWardCoordinatesByCode(current.wardCode, currentCity);
      nextLocation = {
        type: 'radius',
        lat: wardCoords?.lat || (currentCity === 'SG' ? 10.7769 : 21.0285),
        lng: wardCoords?.lng || (currentCity === 'SG' ? 106.7009 : 105.8542),
        radiusM: 2000,
        label: current.label,
        wardCode: current.wardCode,
      };
    } else {
      const defaultCenter = currentCity === 'SG' ? DEFAULT_HCMC_CENTER : DEFAULT_HANOI_CENTER;
      nextLocation = {
        type: 'radius',
        lat: defaultCenter.lat,
        lng: defaultCenter.lng,
        radiusM: 2000,
        label: currentCity === 'SG' ? 'Sài Gòn' : 'Hà Nội',
      };
    }
    commitSearch({ location: nextLocation });
  };

  const handleClearPrice = () => {
    setDraftBudgetMin('');
    setDraftBudgetMax('');
    commitSearch({ minPrice: '', maxPrice: '' });
  };

  const handleResetAll = () => {
    setDraftKeyword('');
    setDraftBudgetMin('');
    setDraftBudgetMax('');
    setDraftGender('any');
    setDraftDateFilter(DEFAULT_DATE_FILTER);
    setAppliedDateFilter(DEFAULT_DATE_FILTER);
    setLocationFilter(null);
    locationFilterRef.current = null;
    setRoomFilter('all');
    const params = new URLSearchParams();
    params.set('tab', 'roommate');
    pushHomeSearchParams(params);
  };

  // Submit roommate post to public.posts (post_type='roommate') — Create or Update
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setFormError('');
    setSuccessNotice('');

    const parsedPrice = parseVndInput(formPrice);

    setFormLoading(true);

    try {
      const selectedLoc = formLocationFilter;
      let locationType: 'ward' | 'radius' | null = selectedLoc?.type || null;
      let wardCodes: string[] | null = null;
      let lat: number | null = null;
      let lng: number | null = null;
      let radiusM: number | null = null;
      let selectedWardName: string | null = null;

      if (selectedLoc?.type === 'radius') {
        locationType = 'radius';
        lat = selectedLoc.lat;
        lng = selectedLoc.lng;
        radiusM = selectedLoc.radiusM;
        selectedWardName = `Khu vực đã chọn [radius:${lat},${lng},${radiusM}]`;
      } else if (selectedLoc?.type === 'ward') {
        locationType = 'ward';
        wardCodes = selectedLoc.wardCodes && selectedLoc.wardCodes.length > 0 ? selectedLoc.wardCodes : [selectedLoc.wardCode];
        const fullNames = wardCodes
          .map((code) => HANOI_UNITS.find((u) => u.code === code)?.name || code)
          .filter(Boolean);
        selectedWardName = fullNames.join(', ');
      } else {
        selectedWardName = formWard.trim() || null;
      }

      const extractedData = {
        budget_min: null,
        budget_max: parsedPrice,
        price_unit: 'per_person',
        gender_preference: formGenderPref,
        desired_ward: selectedWardName,
        desired_location_type: locationType,
        desired_ward_codes: wardCodes,
        desired_lat: lat,
        desired_lng: lng,
        desired_radius_m: radiusM,
        room_state: 'no_room',
      };

      const basePayload = {
        user_id: user.id,
        building_id: null,
        post_type: 'roommate',
        author_role: 'seeker',
        source_type: 'direct_user',
        price: parsedPrice,
        content: formBio.trim() || null,
        contact_info: formContact.trim() || null,
        status: formStatus === 'active' ? 'approved' : 'hidden',
        extracted_data: extractedData,
        published_at: new Date().toISOString(),
      };

      let savedData: any = null;
      if (myProfile?.id) {
        const { data, error } = await supabase
          .from('posts')
          .update(basePayload)
          .eq('id', myProfile.id)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert(basePayload)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
      }

      if (saveFormContactForLater && formContact.trim()) {
        await saveUserContact(supabase, formContact);
      }

      setMyProfile(savedData as Profile);
      setSuccessNotice(
        myProfile ? 'Cập nhật tin đăng thành công!' : 'Đã đăng tin ở ghép thành công!'
      );
      trackFormStep('roommate_post', 'submitted');
      setTimeout(() => setSuccessNotice(''), 4000);
      fetchProfiles();
    } catch (err: any) {
      console.error('Error saving roommate post:', err?.message || err?.details || err);
      setFormError(sanitizeErrorMessage(err?.message || err?.details || 'Có lỗi xảy ra khi lưu thông tin.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectLocationChip = (selection: LocationSelection) => {
    if (subTab === 'post') {
      setFormLocationFilter(selection);
      setFormWard(selection.label || '');
    } else {
      commitSearch({ location: selection });
    }
  };

  const handleSelectPriceChip = (min: string, max: string) => {
    if (subTab === 'post') {
      setFormPrice(max || min || '3tr');
      setFormError('');
    } else {
      setDraftBudgetMin(min);
      setDraftBudgetMax(max);
      commitSearch({ minPrice: min, maxPrice: max });
    }
  };

  const handleSelectKeywordChip = (kw: string) => {
    if (subTab === 'post') {
      setFormBio((prev) => (prev ? `${prev}, ${kw}` : kw));
    } else {
      const currentTokens = parseKeywords(draftKeyword);
      const lowerKw = kw.toLowerCase();
      let nextKw = '';
      if (currentTokens.includes(lowerKw)) {
        const nextTokens = currentTokens.filter((t) => t !== lowerKw);
        nextKw = nextTokens.join(', ');
      } else {
        nextKw = draftKeyword ? `${draftKeyword}, ${kw}` : kw;
      }
      setDraftKeyword(nextKw);
      commitSearch({ keyword: nextKw });
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
        {/* Error and Success Notices */}
        {(priceError || formError || successNotice) && (
          <div className="flex flex-col gap-1">
            {priceError && (
              <div className="text-xs text-red-600 font-semibold px-1">
                {priceError}
              </div>
            )}
            {formError && (
              <div className="text-xs text-red-600 font-semibold px-1">
                {formError}
              </div>
            )}
            {successNotice && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 rounded px-2.5 py-1 font-semibold">
                {successNotice}
              </div>
            )}
          </div>
        )}

        {subTab === 'find' ? (
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              {/* Location Dropdown */}
              <div className="flex-1 min-w-0">
                <LocationSelectDropdown
                  value={locationFilter}
                  onChange={(nextLocation) => commitSearch({ location: nextLocation })}
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
                />
              </div>

              {/* HIDE FOR MVP DATA SPARSITY: Price Range commented out
              <div className="flex items-center gap-1.5 w-full md:w-[250px] shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field w-1/2 text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Từ (giá/người)"
                  value={draftBudgetMin}
                  onFocus={() => setActiveFocus('price')}
                  onBlur={handlePriceBlur}
                  onChange={(e) => {
                    setDraftBudgetMin(e.target.value);
                    setPriceError('');
                  }}
                  onMouseEnter={handleHoverMarqueeEnter}
                  onMouseLeave={handleHoverMarqueeLeave}
                />
                <span className="text-secondary text-xs font-semibold">-</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field w-1/2 text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Đến (giá/người)"
                  value={draftBudgetMax}
                  onFocus={() => setActiveFocus('price')}
                  onBlur={handlePriceBlur}
                  onChange={(e) => {
                    setDraftBudgetMax(e.target.value);
                    setPriceError('');
                  }}
                  onMouseEnter={handleHoverMarqueeEnter}
                  onMouseLeave={handleHoverMarqueeLeave}
                />
              </div>
              */}

              {/* Date Dropdown */}
              <div className="w-full md:w-[130px] shrink-0">
                <DateSelectDropdown
                  value={draftDateFilter}
                  onChange={(val) => {
                    setDraftDateFilter(val);
                    commitSearch({ date: val });
                  }}
                />
              </div>

              {/* Gender Dropdown */}
              <div className="w-full md:w-[130px] shrink-0">
                <GenderSelectDropdown
                  value={draftGender}
                  onChange={(val) => {
                    setDraftGender(val);
                    commitSearch({ gender: val });
                  }}
                  options={GENDER_FILTER_OPTIONS}
                  placeholder="Giới tính"
                />
              </div>

              {/* Sub-tabs Switcher */}
              <div className="flex shrink-0">
                <SegmentedControl
                  ariaLabel="Roommate mode"
                  fullWidth
                  options={SUBTAB_OPTIONS}
                  activeKey={subTab}
                  onChange={handleSubTabChange}
                  className="w-full md:w-auto"
                />
              </div>

              {/* Search Action Button */}
              <button
                type="submit"
                className="btn-primary text-xs md:text-sm px-6 py-2.5 whitespace-nowrap font-bold w-full md:w-auto shrink-0 min-w-[80px] flex items-center justify-center cursor-pointer"
              >
                Tìm
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitProfile} className="flex flex-col gap-3">
            {/* Helper Banner for Users with Existing Rooms */}
            <div className="text-xs text-secondary bg-surface border border-secondary/25 rounded-md px-3 py-2 flex items-center justify-between gap-2">
              <span>Đã có sẵn phòng cần tìm bạn ở cùng?</span>
              <Link
                href="/?tab=listing&subtab=post"
                className="font-bold text-tertiary underline hover:opacity-80 shrink-0"
              >
                Đăng tin tại mục Thuê nhà &rarr;
              </Link>
            </div>

            {/* Top Row: Location, Budget, Gender */}
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              {/* Location Picker for Room-less Demand (ward / radius) */}
              <div className="w-full md:w-[260px] lg:w-[280px] shrink-0">
                <LocationSelectDropdown
                  value={formLocationFilter}
                  onChange={(nextLocation) => {
                    setFormLocationFilter(nextLocation);
                    setFormWard(nextLocation ? nextLocation.label : '');
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
                />
              </div>

              {/* Price / Budget Input */}
              <div className="w-full md:w-[220px] shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field w-full text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Giá / Ngân sách/người (VD: 3tr)"
                  value={formPrice}
                  onFocus={() => setActiveFocus('price')}
                  onChange={(e) => {
                    setFormPrice(e.target.value);
                    setFormError('');
                  }}
                  onMouseEnter={handleHoverMarqueeEnter}
                  onMouseLeave={handleHoverMarqueeLeave}
                />
              </div>

              {/* Gender Preference Dropdown */}
              <div className="w-full md:w-[150px] shrink-0">
                <GenderSelectDropdown
                  value={formGenderPref}
                  onChange={(val) => setFormGenderPref(val)}
                  options={GENDER_PREF_OPTIONS}
                  placeholder="Giới tính"
                />
              </div>
            </div>

            {/* Contact Info Input */}
            <div className="w-full">
              <ContactField
                placeholder="Thông tin liên hệ (SĐT/Zalo, Facebook, Instagram)"
                value={formContact}
                onChange={setFormContact}
                showSaveOption
                saveForLater={saveFormContactForLater}
                onSaveForLaterChange={setSaveFormContactForLater}
              />
            </div>

            {/* Dedicated Multi-line Mô tả Content Box */}
            <div className="w-full">
              <textarea
                id="roommate-bio-content"
                rows={3}
                className="input-field w-full text-xs md:text-sm p-3 focus:outline-none focus:ring-1 focus:ring-primary rounded-md font-sans leading-relaxed resize-y min-h-[72px]"
                placeholder="Mô tả bản thân & nhu cầu ở ghép (giờ giấc sinh hoạt, tính cách, yêu cầu đối với bạn cùng phòng...)"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Allow natural multiline newline without triggering form submission
                    e.stopPropagation();
                  }
                }}
              />
            </div>

            {/* Mobile Controls: Visibility, Subtabs & Submit Button */}
            <div className="flex md:hidden flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-secondary shrink-0">Trạng thái:</span>
                <GenderSelectDropdown
                  value={formStatus}
                  onChange={(val) => setFormStatus(val as 'active' | 'inactive')}
                  options={VISIBILITY_OPTIONS}
                  placeholder="Trạng thái"
                  className="flex-1"
                />
              </div>

              <SegmentedControl
                ariaLabel="Roommate mode"
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
                  Đăng nhập để đăng tin
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold w-full flex items-center justify-center cursor-pointer"
                >
                  {formLoading
                    ? 'Đang lưu...'
                    : myProfile
                    ? 'Cập nhật tin đăng'
                    : '+ Đăng tin ở ghép'}
                </button>
              )}
            </div>

            {/* Desktop Bottom Row: Subtabs, Visibility Dropdown & Dynamic Action Button */}
            <div className="hidden md:flex flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                <SegmentedControl
                  ariaLabel="Roommate mode"
                  options={SUBTAB_OPTIONS}
                  activeKey={subTab}
                  onChange={handleSubTabChange}
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary">Trạng thái:</span>
                  <GenderSelectDropdown
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as 'active' | 'inactive')}
                    options={VISIBILITY_OPTIONS}
                    placeholder="Trạng thái"
                    className="w-[130px]"
                  />
                </div>
              </div>

              {!user ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer"
                >
                  Đăng nhập để đăng tin
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer"
                >
                  {formLoading
                    ? 'Đang lưu...'
                    : myProfile
                    ? 'Cập nhật tin đăng'
                    : '+ Đăng tin ở ghép'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <MapPickerToolbar active={shouldShowCompactMapPicker}>
        <LocationSelectDropdown
          value={subTab === 'post' ? formLocationFilter : locationFilter}
          onChange={(nextLocation) => {
            if (subTab === 'post') {
              setFormLocationFilter(nextLocation);
              setFormWard(nextLocation ? nextLocation.label : '');
            } else {
              setLocationFilter(nextLocation);
            }
          }}
          onToggleMapPicker={toggleLocationPicker}
          isMapPicking={isPickingLocation}
          onFocusInput={() => setIsPickingLocation(true)}
          onClose={handleCloseLocationPicker}
        />
      </MapPickerToolbar>


      {/* Mobile View Toggle Buttons */}
      <div
        className={[
          'lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur py-2 -mx-4 px-4 sm:-mx-6 sm:px-6',
          isPickingLocation ? 'hidden' : 'flex',
        ].join(' ')}
      >
        <SegmentedControl
          ariaLabel="Roommate view"
          fullWidth
          options={[
            {
              key: 'list',
              label: subTab === 'post' ? 'Gợi ý' : 'Danh sách',
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
        {/* Left Column: Cards Feed + Overlay on Desktop */}
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
              {subTab === 'post' && (
                <span className="text-secondary text-xs font-semibold">Gợi ý</span>
              )}
              {subTab !== 'post' && (
                <div className="flex-1 flex items-center gap-3">
                  <FeedSelectDropdown
                    label="Có phòng"
                    value={roomFilter}
                    options={ROOM_FILTER_OPTIONS}
                    onChange={handleRoomFilterChange}
                  />
                  <FeedSelectDropdown
                    label="Sắp xếp"
                    value={sortOrder}
                    options={FEED_SORT_OPTIONS}
                    onChange={handleSortChange}
                    className="ml-auto"
                    alignMenu="right"
                  />
                </div>
              )}
            </div>

            {subTab !== 'post' && (
              <div className="lg:hidden flex items-center flex-wrap gap-x-3 gap-y-1.5 pb-1">
                <FeedSelectDropdown
                  label="Có phòng"
                  value={roomFilter}
                  options={ROOM_FILTER_OPTIONS}
                  onChange={handleRoomFilterChange}
                />
                <FeedSelectDropdown
                  label="Sắp xếp"
                  value={sortOrder}
                  options={FEED_SORT_OPTIONS}
                  onChange={handleSortChange}
                  className="ml-auto"
                  alignMenu="right"
                />
              </div>
            )}
            {loading ? (
              <div className="py-12 flex items-center justify-center text-secondary text-sm">
                Đang tải...
              </div>
            ) : currentProfiles.length === 0 ? (
              subTab === 'post' ? (
                <div className="py-12 text-center text-secondary bg-surface rounded-md border border-secondary text-sm p-4">
                  Không tìm thấy người ở ghép nào khớp với tiêu chí của bạn.
                </div>
              ) : (
                <ZeroStateRecoveryBox
                  variant="feed"
                  hasLocationRadius={Boolean(locationFilter)}
                  hasPriceFilter={Boolean(appliedBudgetMin || appliedBudgetMax)}
                  onExpandRadius={handleExpandRadius}
                  onClearPrice={handleClearPrice}
                  onResetAll={handleResetAll}
                />
              )
            ) : (
              <div className="flex flex-col gap-3">
                {currentProfiles.slice(0, visibleCount).map((profile) => (
                  <RoommateCard
                    key={profile.id}
                    profile={{
                      id: profile.id,
                      short_id: profile.short_id,
                      avatar_url: profile.avatar_url,
                      desired_ward: profile.desired_ward,
                      desired_location_type: profile.desired_location_type,
                      address_raw: profile.address_raw,
                      gender_pref: profile.gender_pref,
                      price: profile.price,
                      price_unit: profile.price_unit,
                      budget_min: profile.budget_min,
                      budget_max: profile.budget_max,
                      contact_info: profile.contact_info,
                      source_type: profile.source_type,
                      source_url: profile.source_url,
                      post_type: profile.post_type || 'roommate',
                      bio: profile.bio,
                      building_id: profile.building_id,
                      created_at: profile.created_at,
                    }}
                    isLoggedIn={!!user}
                    onRequireAuth={() => setIsAuthModalOpen(true)}
                    onSelect={handleSelectProfile}
                    onMouseEnter={() => setHoveredPinId(profile.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                  />
                ))}
                {visibleCount < currentProfiles.length && (
                  <div ref={sentinelRef} className="py-2 text-center text-xs text-secondary">
                    Đang tải...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Detail BottomSheet Overlay */}
          {selectedProfileId && (
            <BottomSheet
              containerRef={leftColRef}
              topAnchorRef={listHeaderRef}
              snapState={snapState}
              onSnapChange={(newSnap) => {
                setSnapState(newSnap);
                trackViewModeToggled({
                  tab: 'roommate',
                  mode: 'split_view',
                  sheet_state: newSnap,
                });
              }}
              peekHeight={210}
              showHandle={false}
            >
              {selectedBuildingId ? (
                <BuildingDetailPane
                  elasticId={selectedBuildingId}
                  initialTab="roommates"
                  highlightPostId={buildingTargetPostId || undefined}
                  onClose={() => handleSelectProfile(null)}
                  className="pb-10"
                />
              ) : (
                <RoommateDetailPane
                  profileId={selectedProfileId}
                  onClose={() => handleSelectProfile(null)}
                  onRequireAuth={() => setIsAuthModalOpen(true)}
                  className="pb-10"
                />
              )}
            </BottomSheet>
          )}
        </div>

        {/* Right Column: Leaflet Map */}
        <div className={`lg:col-span-8 relative ${mobileViewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div
            data-testid="search-map-view"
            className="lg:sticky lg:top-20 h-[calc(100dvh-112px)] min-h-[calc(100dvh-112px)] lg:h-[850px] lg:min-h-0 w-full rounded-md overflow-hidden border border-secondary relative"
          >
            {subTab === 'find' && !loading && !isPickingLocation && currentProfiles.length === 0 && (
              <ZeroStateRecoveryBox
                variant="map-overlay"
                hasLocationRadius={Boolean(locationFilter)}
                hasPriceFilter={Boolean(appliedBudgetMin || appliedBudgetMax)}
                onExpandRadius={handleExpandRadius}
                onClearPrice={handleClearPrice}
                onResetAll={handleResetAll}
              />
            )}
            {(() => {
              const mapRoommatePins: MapRoommatePin[] = currentProfiles.map((p) => ({
                id: p.id,
                shortId: p.short_id,
                buildingId: p.building_id,
                addressRaw: p.address_raw,
                roomState: p.room_state,
                price: p.price,
                priceUnit: p.price_unit,
                desiredWard: p.desired_ward,
                desiredLocationType: p.desired_location_type,
                budgetMin: Number(p.budget_min ?? 0),
                budgetMax: Number(p.budget_max ?? 0),
                genderPref: p.gender_pref || 'any',
                createdAt: p.created_at,
                avatarUrl: p.avatar_url,
                bio: p.bio,
                lat: p.desired_lat ?? undefined,
                lng: p.desired_lng ?? undefined,
                desiredWardCodes: p.desired_ward_codes ?? undefined,
                desiredRadiusM: p.desired_radius_m ?? undefined,
              }));

              const activeLoc = subTab === 'post' ? formLocationFilter : locationFilter;
              const selectedPoint =
                activeLoc?.type === 'radius'
                  ? { lat: activeLoc.lat, lng: activeLoc.lng }
                  : undefined;
              const selectedRadiusM =
                activeLoc?.type === 'radius' ? activeLoc.radiusM : 1000;

              return (
                <InteractiveMap
                  activeCity={currentCity}
                  roommatePins={mapRoommatePins}
                  listingPins={[]}
                  height="100%"
                  isPickingLocation={isPickingLocation}
                  selectedPoint={selectedPoint}
                  selectedRadiusM={selectedRadiusM}
                  onPointSelect={handlePointSelect}
                  onRadiusSelect={handleRadiusSelect}
                  onClosePicker={handleCloseLocationPicker}
                  hoveredPinId={hoveredPinId}
                  selectedBuildingId={selectedBuildingId}
                  selectedProfileId={selectedProfileId}
                  selectedPostId={buildingTargetPostId || undefined}
                  onSelectBuilding={(id, rId) => handleSelectProfile(rId || id)}
                  onSelectProfile={(id) => handleSelectProfile(id)}
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
