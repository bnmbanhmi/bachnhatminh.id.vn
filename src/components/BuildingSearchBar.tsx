'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationSelectDropdown from '@/components/ui/LocationSelectDropdown';
import AddressSelectDropdown from '@/components/ui/AddressSelectDropdown';
import PostTypeSelectDropdown, { POST_SOURCE_OPTIONS } from '@/components/ui/PostTypeSelectDropdown';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';
import GenderSelectDropdown, { GenderOption } from '@/components/ui/GenderSelectDropdown';
import ContactField from '@/components/ui/ContactField';
import { appendLocationParams, type LocationSelection } from '@/lib/location';
import { parseVndInput, parseKeywords, handleHoverMarqueeEnter, handleHoverMarqueeLeave } from '@/lib/search';
import DynamicSuggestionChips, { type ChipCategory } from '@/components/ui/DynamicSuggestionChips';
import MediaUploader from '@/components/ui/MediaUploader';
import DateSelectDropdown from '@/components/ui/DateSelectDropdown';
import { DateFilterOption } from '@/lib/dates';
import { pushHomeSearchParams } from '@/lib/home-url-state';

export const SUBTAB_BUILDING_OPTIONS: SegmentedOption[] = [
  { key: 'listings', label: 'Tin đăng' },
  { key: 'post', label: 'Đăng tin' },
  { key: 'search', label: 'Nhu cầu' },
];

export const REQUEST_VISIBILITY_OPTIONS: GenderOption[] = [
  { value: 'approved', label: 'Công khai' },
  { value: 'hidden', label: 'Riêng tư' },
];

export interface BuildingSearchBarProps {
  initialLocation?: LocationSelection | null;
  initialKeyword?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  subTab?: 'listings' | 'post' | 'search';
  onSubTabChange?: (key: 'listings' | 'post' | 'search') => void;
  user?: any;
  onOpenAuth?: () => void;

  // Search Submission (for listings mode)
  onSearchSubmit?: (filters: {
    location: LocationSelection | null;
    keyword: string;
    minPrice: string;
    maxPrice: string;
    date?: DateFilterOption;
  }) => void;
  dateFilter?: DateFilterOption;
  onChangeDateFilter?: (val: DateFilterOption) => void;
  onToggleLocationPicker?: () => void;
  isLocationPicking?: boolean;

  // Inline Post Form State (for post mode)
  selectedBuildingId?: string | null;
  selectedBuildingAddress?: string;
  onClearBuilding?: () => void;
  postAddress?: string;
  postPoint?: { lat: number; lng: number } | null;
  onChangePostAddress?: (addr: string) => void;
  onChangePostPoint?: (pt: { lat: number; lng: number } | null) => void;
  postPrice?: string;
  onChangePostPrice?: (val: string) => void;
  postArea?: string;
  onChangePostArea?: (val: string) => void;
  postContent?: string;
  onChangePostContent?: (val: string) => void;
  postImages?: string[];
  onChangePostImages?: (urls: string[]) => void;
  postSource?: string;
  onChangePostSource?: (val: string) => void;
  postGenderPref?: string;
  onChangePostGenderPref?: (val: string) => void;
  postContact?: string;
  onChangePostContact?: (val: string) => void;
  savePostContactForLater?: boolean;
  onChangeSavePostContactForLater?: (checked: boolean) => void;
  postMoveInDate?: string;
  onChangePostMoveInDate?: (val: string) => void;
  onPostSubmit?: (e: React.FormEvent) => void;
  postSubmitting?: boolean;

  // Saved Search Request Form State (for request mode)
  reqLocation?: LocationSelection | null;
  onChangeReqLocation?: (loc: LocationSelection | null) => void;
  reqMinPrice?: string;
  onChangeReqMinPrice?: (val: string) => void;
  reqMaxPrice?: string;
  onChangeReqMaxPrice?: (val: string) => void;
  reqContent?: string;
  onChangeReqContent?: (val: string) => void;
  reqContact?: string;
  onChangeReqContact?: (val: string) => void;
  saveReqContactForLater?: boolean;
  onChangeSaveReqContactForLater?: (checked: boolean) => void;
  reqStatus?: 'approved' | 'hidden';
  onChangeReqStatus?: (val: 'approved' | 'hidden') => void;
  onReqSubmit?: (e: React.FormEvent) => void;
  reqSubmitting?: boolean;

  onFocusLocation?: () => void;
  onCloseLocation?: () => void;

  className?: string;
}

export default function BuildingSearchBar({
  initialLocation = null,
  initialKeyword = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  dateFilter = 'all',
  onChangeDateFilter,
  subTab = 'listings',
  onSubTabChange,
  user = null,
  onOpenAuth,
  onSearchSubmit,
  onToggleLocationPicker,
  isLocationPicking = false,
  selectedBuildingId = null,
  selectedBuildingAddress = '',
  onClearBuilding,
  postAddress = '',
  postPoint = null,
  onChangePostAddress,
  onChangePostPoint,
  postPrice = '',
  onChangePostPrice,
  postArea = '',
  onChangePostArea,
  postContent = '',
  onChangePostContent,
  postImages = [],
  onChangePostImages,
  postSource = 'direct',
  onChangePostSource,
  postGenderPref = 'any',
  onChangePostGenderPref,
  postContact = '',
  onChangePostContact,
  savePostContactForLater = false,
  onChangeSavePostContactForLater,
  postMoveInDate = '',
  onChangePostMoveInDate,
  onPostSubmit,
  postSubmitting = false,
  reqLocation = null,
  onChangeReqLocation,
  reqMinPrice = '',
  onChangeReqMinPrice,
  reqMaxPrice = '',
  onChangeReqMaxPrice,
  reqContent = '',
  onChangeReqContent,
  reqContact = '',
  onChangeReqContact,
  saveReqContactForLater = false,
  onChangeSaveReqContactForLater,
  reqStatus = 'approved',
  onChangeReqStatus,
  onReqSubmit,
  reqSubmitting = false,
  onFocusLocation,
  onCloseLocation,
  className = '',
}: BuildingSearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState<LocationSelection | null>(initialLocation);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [localPostSource, setLocalPostSource] = useState(postSource);
  const [priceError, setPriceError] = useState('');
  const [activeFocus, setActiveFocus] = useState<ChipCategory>('default');
  const [isDateFocused, setIsDateFocused] = useState(false);

  useEffect(() => {
    setLocalPostSource(postSource);
  }, [postSource]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setMinPrice(initialMinPrice);
  }, [initialMinPrice]);

  useEffect(() => {
    setMaxPrice(initialMaxPrice);
  }, [initialMaxPrice]);

  useEffect(() => {
    if (isLocationPicking) {
      setActiveFocus('location');
    }
  }, [isLocationPicking]);

  // 500ms Debounced auto-swap and validation for minPrice and maxPrice
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsedMin = parseVndInput(minPrice);
      const parsedMax = parseVndInput(maxPrice);
      if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
        setMinPrice(maxPrice);
        setMaxPrice(minPrice);
        setPriceError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const handlePriceBlur = () => {
    const parsedMin = parseVndInput(minPrice);
    const parsedMax = parseVndInput(maxPrice);
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      setMinPrice(maxPrice);
      setMaxPrice(minPrice);
      setPriceError('');
    }
  };

  // 500ms Debounced auto-swap for reqMinPrice and reqMaxPrice
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsedMin = parseVndInput(reqMinPrice);
      const parsedMax = parseVndInput(reqMaxPrice);
      if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
        onChangeReqMinPrice?.(reqMaxPrice);
        onChangeReqMaxPrice?.(reqMinPrice);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [reqMinPrice, reqMaxPrice, onChangeReqMinPrice, onChangeReqMaxPrice]);

  const handleReqPriceBlur = () => {
    const parsedMin = parseVndInput(reqMinPrice);
    const parsedMax = parseVndInput(reqMaxPrice);
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      onChangeReqMinPrice?.(reqMaxPrice);
      onChangeReqMaxPrice?.(reqMinPrice);
    }
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPriceError('');
    const cleanQuery = keyword.trim();

    let finalMin = minPrice;
    let finalMax = maxPrice;
    const parsedMin = parseVndInput(minPrice);
    const parsedMax = parseVndInput(maxPrice);

    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      finalMin = maxPrice;
      finalMax = minPrice;
      setMinPrice(finalMin);
      setMaxPrice(finalMax);
    }

    const isCanonicalId =
      /^[a-z]{2}[0-9]{6}$/i.test(cleanQuery) ||
      /^[a-z]{4}[0-9]{4,6}$/i.test(cleanQuery) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);

    if (isCanonicalId) {
      router.push(`/${cleanQuery.toLowerCase()}`);
      return;
    }

    if (onSearchSubmit) {
      onSearchSubmit({ location, keyword: cleanQuery, minPrice: finalMin, maxPrice: finalMax, date: dateFilter });
      return;
    }

    const finalParsedMin = parseVndInput(finalMin);
    const finalParsedMax = parseVndInput(finalMax);

    const params = new URLSearchParams();
    params.set('tab', 'building');
    appendLocationParams(params, location);
    if (cleanQuery) params.set('q', cleanQuery);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    if (finalParsedMin !== null) params.set('min_price', String(finalParsedMin));
    if (finalParsedMax !== null) params.set('max_price', String(finalParsedMax));

    const queryString = params.toString();
    pushHomeSearchParams(queryString);
  };

  const handleSelectLocationChip = (selection: LocationSelection) => {
    if (subTab === 'search') {
      onChangeReqLocation?.(selection);
    } else {
      setLocation(selection);
    }
  };

  const handleSelectPriceChip = (min: string, max: string) => {
    if (subTab === 'search') {
      onChangeReqMinPrice?.(min);
      onChangeReqMaxPrice?.(max);
    } else {
      setMinPrice(min);
      setMaxPrice(max);
      setPriceError('');
    }
  };

  const handleSelectKeywordChip = (kw: string) => {
    if (subTab === 'post') {
      onChangePostContent?.(postContent ? `${postContent}, ${kw}` : kw);
    } else if (subTab === 'search') {
      onChangeReqContent?.(reqContent ? `${reqContent}, ${kw}` : kw);
    } else {
      const currentTokens = parseKeywords(keyword);
      const lowerKw = kw.toLowerCase();
      if (currentTokens.includes(lowerKw)) {
        const nextTokens = currentTokens.filter((t) => t !== lowerKw);
        setKeyword(nextTokens.join(', '));
      } else {
        const next = keyword ? `${keyword}, ${kw}` : kw;
        setKeyword(next);
      }
    }
  };

  return (
    <div className={`building-search-bar bg-surface border border-secondary p-4 rounded-xl shadow-sm ${className}`}>
      {subTab === 'listings' ? (
        <form onSubmit={handleSubmitSearch} className="flex flex-col gap-3">
          {priceError && (
            <div className="text-xs text-red-600 font-semibold px-1">
              {priceError}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            {/* Location Filter Dropdown */}
            <div className="flex-1 min-w-0">
              <LocationSelectDropdown
                value={location}
                onChange={(nextLocation) => {
                  setLocation(nextLocation);
                  if (onSearchSubmit) {
                    onSearchSubmit({ location: nextLocation, keyword, minPrice, maxPrice, date: dateFilter });
                  }
                }}
                onToggleMapPicker={onToggleLocationPicker}
                isMapPicking={isLocationPicking}
                onFocusInput={() => {
                  setActiveFocus('location');
                  onFocusLocation?.();
                }}
                onClose={onCloseLocation}
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="w-full md:w-[130px] shrink-0">
              <DateSelectDropdown
                value={dateFilter}
                onChange={(val) => {
                  onChangeDateFilter?.(val);
                }}
              />
            </div>

            {/* HIDE FOR MVP DATA SPARSITY: Price Range commented out
            <div className="flex items-center gap-1.5 w-full md:w-[230px] shrink-0">
              <input
                id="building-min-price"
                type="text"
                inputMode="decimal"
                className="input-field w-1/2 text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Từ (giá)"
                value={minPrice}
                onFocus={() => setActiveFocus('price')}
                onBlur={handlePriceBlur}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPriceError('');
                }}
                onMouseEnter={handleHoverMarqueeEnter}
                onMouseLeave={handleHoverMarqueeLeave}
              />
              <span className="text-secondary text-xs font-semibold">-</span>
              <input
                id="building-max-price"
                type="text"
                inputMode="decimal"
                className="input-field w-1/2 text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Đến (giá)"
                value={maxPrice}
                onFocus={() => setActiveFocus('price')}
                onBlur={handlePriceBlur}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPriceError('');
                }}
                onMouseEnter={handleHoverMarqueeEnter}
                onMouseLeave={handleHoverMarqueeLeave}
              />
            </div>
            */}

            {/* HIDE FOR MVP DATA SPARSITY: Keyword Search Input commented out
            <input
              id="building-keyword"
              type="text"
              className="input-field flex-1 text-xs md:text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
              placeholder="Từ khóa tiện ích tách bằng dấu phẩy"
              value={keyword}
              onFocus={() => setActiveFocus('keyword')}
              onChange={(e) => setKeyword(e.target.value)}
              onMouseEnter={handleHoverMarqueeEnter}
              onMouseLeave={handleHoverMarqueeLeave}
            />
            */}

            {/* Sub-tabs Switcher */}
            <div className="flex shrink-0">
              <SegmentedControl
                ariaLabel="Building mode"
                fullWidth
                options={SUBTAB_BUILDING_OPTIONS}
                activeKey={subTab}
                onChange={(key) => onSubTabChange?.(key as any)}
                className="w-full md:w-auto"
              />
            </div>

            <button
              type="submit"
              className="btn-primary text-xs md:text-sm px-5 py-2.5 whitespace-nowrap font-bold w-full md:w-auto shrink-0 min-w-[70px] flex items-center justify-center cursor-pointer"
            >
              Tìm
            </button>
          </div>

          {/* HIDE FOR MVP DATA SPARSITY: Dynamic suggestion chips row commented out
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <DynamicSuggestionChips
                activeContext={activeFocus}
                mode="building"
                onSelectLocation={handleSelectLocationChip}
                onSelectPrice={handleSelectPriceChip}
                onSelectKeyword={handleSelectKeywordChip}
                className="flex-1"
              />
            </div>
          </div>
          */}
        </form>
      ) : subTab === 'post' ? (
        <form onSubmit={onPostSubmit} className="flex flex-col gap-3">
          {/* Address Select Dropdown */}
          <div className="w-full">
            <AddressSelectDropdown
              address={postAddress}
              point={postPoint}
              onChangeAddress={(addr) => onChangePostAddress?.(addr)}
              onChangePoint={(pt) => onChangePostPoint?.(pt)}
              onToggleMapPicker={onToggleLocationPicker}
              isMapPicking={isLocationPicking}
              onFocusInput={onFocusLocation}
              onClose={onCloseLocation}
              placeholder="Địa chỉ"
            />
          </div>

          {/* Single Price Input, Area Input, and Nguồn tin Dropdown */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <input
                type="text"
                inputMode="decimal"
                className="input-field text-xs md:text-sm py-2.5"
                placeholder="Giá (VD: 3.5tr, 3500k)"
                value={postPrice}
                onChange={(e) => onChangePostPrice?.(e.target.value)}
                onMouseEnter={handleHoverMarqueeEnter}
                onMouseLeave={handleHoverMarqueeLeave}
                required
              />
              <input
                type="text"
                inputMode="decimal"
                className="input-field text-xs md:text-sm py-2.5"
                placeholder="Diện tích (m², VD: 25)"
                value={postArea}
                onChange={(e) => onChangePostArea?.(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[150px] shrink-0">
              <PostTypeSelectDropdown
                value={localPostSource}
                onChange={(val) => {
                  setLocalPostSource(val);
                  onChangePostSource?.(val);
                }}
                options={POST_SOURCE_OPTIONS}
                placeholder="Nguồn tin"
              />
            </div>
          </div>

          {localPostSource === 'roommate' && (
            <div className="w-full">
              <GenderSelectDropdown
                value={postGenderPref}
                onChange={(val) => onChangePostGenderPref?.(val)}
                placeholder="Yêu cầu giới tính (Nam/Nữ)"
              />
            </div>
          )}

          {/* Contact Info and Move-in Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
            <ContactField
              placeholder="Thông tin liên hệ (SĐT/Zalo, Facebook, Instagram)"
              value={postContact}
              onChange={(val) => onChangePostContact?.(val)}
              showSaveOption
              saveForLater={savePostContactForLater}
              onSaveForLaterChange={(checked) => onChangeSavePostContactForLater?.(checked)}
            />
            <input
              type={isDateFocused || postMoveInDate ? 'date' : 'text'}
              className="input-field text-xs md:text-sm py-2.5"
              placeholder="Ngày chuyển vào"
              value={postMoveInDate}
              onFocus={() => setIsDateFocused(true)}
              onBlur={(e) => {
                if (!e.target.value) {
                  setIsDateFocused(false);
                }
              }}
              onChange={(e) => onChangePostMoveInDate?.(e.target.value)}
            />
          </div>

          {/* Media Uploader (Min 1 image required for listing/roommate) */}
          <MediaUploader
            images={postImages}
            onChange={(urls) => onChangePostImages?.(urls)}
            postType={localPostSource === 'roommate' ? 'roommate' : 'listing'}
            minImages={1}
            maxImages={10}
            disabled={postSubmitting}
          />

          {/* Dedicated Multiline Textarea Content Input */}
          <div className="w-full">
            <textarea
              rows={3}
              className="input-field w-full text-xs md:text-sm p-3 font-sans leading-relaxed resize-y min-h-[72px]"
              placeholder="Mô tả chi tiết phòng (tiện ích, điện nước, giờ giấc, chi phí phát sinh, người liên hệ...)"
              value={postContent}
              onChange={(e) => onChangePostContent?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              required
            />
          </div>

          {/* Mobile Sub-tabs Switcher */}
          <div className="flex md:hidden my-0.5">
            <SegmentedControl
              ariaLabel="Building mode"
              fullWidth
              options={SUBTAB_BUILDING_OPTIONS}
              activeKey={subTab}
              onChange={(key) => onSubTabChange?.(key as any)}
              className="w-full"
            />
          </div>

          {/* Bottom Row: Desktop 3-option Sub-tabs & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
            <div className="hidden md:block shrink-0">
              <SegmentedControl
                ariaLabel="Building mode"
                options={SUBTAB_BUILDING_OPTIONS}
                activeKey={subTab}
                onChange={(key) => onSubTabChange?.(key as any)}
              />
            </div>

            <button
              type={user ? 'submit' : 'button'}
              onClick={!user ? onOpenAuth : undefined}
              disabled={postSubmitting}
              className="btn-primary text-xs md:text-sm px-6 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer w-full sm:w-auto"
            >
              {user ? (postSubmitting ? 'Đang gửi...' : '+ Đăng tin') : 'Đăng nhập để đăng tin'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onReqSubmit} className="flex flex-col gap-3">
          {/* Location & Budget Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="w-full">
              <LocationSelectDropdown
                value={reqLocation}
                onChange={(nextLoc) => onChangeReqLocation?.(nextLoc)}
                onToggleMapPicker={onToggleLocationPicker}
                isMapPicking={isLocationPicking}
                onFocusInput={() => {
                  setActiveFocus('location');
                  onFocusLocation?.();
                }}
                onClose={onCloseLocation}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                className="input-field w-1/2 text-xs md:text-sm py-2.5"
                placeholder="Từ (giá)"
                value={reqMinPrice}
                onFocus={() => setActiveFocus('price')}
                onBlur={handleReqPriceBlur}
                onChange={(e) => onChangeReqMinPrice?.(e.target.value)}
                onMouseEnter={handleHoverMarqueeEnter}
                onMouseLeave={handleHoverMarqueeLeave}
              />
              <span className="text-secondary text-xs font-semibold">-</span>
              <input
                type="text"
                inputMode="decimal"
                className="input-field w-1/2 text-xs md:text-sm py-2.5"
                placeholder="Đến (giá)"
                value={reqMaxPrice}
                onFocus={() => setActiveFocus('price')}
                onBlur={handleReqPriceBlur}
                onChange={(e) => onChangeReqMaxPrice?.(e.target.value)}
                onMouseEnter={handleHoverMarqueeEnter}
                onMouseLeave={handleHoverMarqueeLeave}
              />
            </div>
          </div>

          {/* Multiline Requirement Textarea */}
          <div className="w-full">
            <textarea
              rows={3}
              className="input-field w-full text-xs md:text-sm p-3 font-sans leading-relaxed resize-y min-h-[72px]"
              placeholder="Mô tả chi tiết nhu cầu (diện tích mong muốn, ở 1 mình hay ghép, có ban công, thang máy, khu vực ưu tiên...)"
              value={reqContent}
              onChange={(e) => onChangeReqContent?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              required
            />
          </div>

          {/* Contact Info Input */}
          <div className="w-full">
            <ContactField
              placeholder="Thông tin liên hệ (SĐT/Zalo, Facebook, Instagram)"
              value={reqContact}
              onChange={(val) => onChangeReqContact?.(val)}
              showSaveOption
              saveForLater={saveReqContactForLater}
              onSaveForLaterChange={(checked) => onChangeSaveReqContactForLater?.(checked)}
            />
          </div>

          {/* Mobile Sub-tabs Switcher */}
          <div className="flex md:hidden my-0.5">
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-semibold text-secondary shrink-0">Trạng thái:</span>
              <GenderSelectDropdown
                value={reqStatus}
                onChange={(val) => onChangeReqStatus?.(val as 'approved' | 'hidden')}
                options={REQUEST_VISIBILITY_OPTIONS}
                placeholder="Trạng thái"
                className="flex-1"
              />
            </div>
          </div>

          {/* Mobile Sub-tabs Switcher */}
          <div className="flex md:hidden my-0.5">
            <SegmentedControl
              ariaLabel="Building mode"
              fullWidth
              options={SUBTAB_BUILDING_OPTIONS}
              activeKey={subTab}
              onChange={(key) => onSubTabChange?.(key as any)}
              className="w-full"
            />
          </div>

          {/* Bottom Row: Desktop 3-option Sub-tabs & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              <div className="hidden md:block shrink-0">
                <SegmentedControl
                  ariaLabel="Building mode"
                  options={SUBTAB_BUILDING_OPTIONS}
                  activeKey={subTab}
                  onChange={(key) => onSubTabChange?.(key as any)}
                />
              </div>

              <DynamicSuggestionChips
                activeContext={activeFocus}
                mode="building"
                onSelectLocation={handleSelectLocationChip}
                onSelectPrice={handleSelectPriceChip}
                onSelectKeyword={handleSelectKeywordChip}
                className="flex-1"
              />

              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-secondary">Trạng thái:</span>
                <GenderSelectDropdown
                  value={reqStatus}
                  onChange={(val) => onChangeReqStatus?.(val as 'approved' | 'hidden')}
                  options={REQUEST_VISIBILITY_OPTIONS}
                  placeholder="Trạng thái"
                  className="w-[130px]"
                />
              </div>
            </div>

            <button
              type={user ? 'submit' : 'button'}
              onClick={!user ? onOpenAuth : undefined}
              disabled={reqSubmitting}
              className="btn-primary text-xs md:text-sm px-6 py-2.5 whitespace-nowrap font-bold shrink-0 flex items-center justify-center cursor-pointer w-full sm:w-auto"
            >
              {user ? (reqSubmitting ? 'Đang gửi...' : '+ Lưu nhu cầu') : 'Đăng nhập để lưu nhu cầu'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
