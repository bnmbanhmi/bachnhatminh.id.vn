'use client';

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard, { type Listing } from '@/components/ListingCard';
import SegmentedControl from '@/components/ui/SegmentedControl';
import BuildingDetailPane from '@/components/BuildingDetailPane';
import BottomSheet, { SnapState } from '@/components/ui/BottomSheet';
import { PORTFOLIO_LISTINGS } from '@/lib/portfolio-data';

export interface BuildingSearchTabProps {
  className?: string;
  showSearchBar?: boolean;
  mobileViewMode?: 'list' | 'map';
  onMobileViewModeChange?: (mode: 'list' | 'map') => void;
}

function BuildingSearchTabContent({
  className = '',
  mobileViewMode: propMobileViewMode,
  onMobileViewModeChange,
}: BuildingSearchTabProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'projects';
  const currentCategory =
    tabParam === 'achievements'
      ? 'achievements'
      : tabParam === 'education'
      ? 'education'
      : 'projects';

  const displayedListings = useMemo(() => {
    return PORTFOLIO_LISTINGS.filter((l) => l.post_type === currentCategory);
  }, [currentCategory]);

  const [snapState, setSnapState] = useState<SnapState>('peek');
  const [internalMobileViewMode, setInternalMobileViewMode] = useState<'list' | 'map'>('list');
  const mobileViewMode = propMobileViewMode ?? internalMobileViewMode;
  const setMobileViewMode = useCallback(
    (mode: 'list' | 'map') => {
      setInternalMobileViewMode(mode);
      onMobileViewModeChange?.(mode);
    },
    [onMobileViewModeChange]
  );
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Building & Post Selection state
  const buildingParam = searchParams.get('building') || searchParams.get('post') || null;
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(buildingParam);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(buildingParam);
  const leftColRef = useRef<HTMLDivElement>(null);
  const listHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedBuildingId(null);
    setSelectedPostId(null);
  }, [currentCategory]);

  const handleSelectBuilding = (buildingId: string | null, postId?: string | null) => {
    const cleanBuildingId = buildingId && buildingId.trim() ? buildingId.trim() : null;
    const cleanPostId = postId && postId.trim() ? postId.trim() : null;
    setSelectedBuildingId(cleanBuildingId);
    setSelectedPostId(cleanPostId);
    setSnapState('peek');
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Mobile View Toggle Buttons */}
      <div
        className="lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 flex"
      >
        <SegmentedControl
          ariaLabel="View mode"
          fullWidth
          options={[
            { key: 'list', label: 'List' },
            { key: 'map', label: 'Preview' },
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

      {/* Main Split Layout: Left Feed / Cards, Right Embed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 lg:mt-4 min-h-[500px]">
        {/* Left Column: Feed Cards */}
        <div
          ref={leftColRef}
          className="lg:col-span-4 relative flex flex-col lg:h-[850px] lg:max-h-[850px]"
        >
          <div
            className={`flex-1 lg:overflow-y-auto pr-1.5 flex flex-col gap-2.5 ${
              mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div ref={listHeaderRef} className="hidden lg:flex" />

            <div className="flex flex-col gap-2.5">
              {displayedListings.map((list) => {
                const isSelected = selectedPostId === list.id;
                return (
                  <div
                    key={list.id}
                    onMouseEnter={() => setHoveredPinId(list.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                  >
                    <ListingCard
                      listing={list}
                      title={list.title}
                      onSelect={(bId: string, pId?: string) => handleSelectBuilding(bId || list.id, pId || list.id)}
                      onMouseEnter={() => setHoveredPinId(list.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Building Detail Overlay on Desktop / Mobile */}
          {(selectedBuildingId || selectedPostId) && (
            <BottomSheet
              containerRef={leftColRef}
              topAnchorRef={listHeaderRef}
              snapState={snapState}
              onSnapChange={(newSnap) => setSnapState(newSnap)}
              peekHeight={210}
              showHandle={false}
            >
              <BuildingDetailPane
                elasticId={selectedBuildingId || undefined}
                postId={selectedPostId || undefined}
                initialTab="all"
                highlightPostId={selectedPostId || undefined}
                onClose={() => handleSelectBuilding(null)}
                className="pb-10"
              />
            </BottomSheet>
          )}
        </div>

        {/* Right Column: Embed View */}
        <div
          className={`lg:col-span-8 relative ${
            mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div
            data-testid="search-map-view"
            className="lg:sticky lg:top-20 h-[calc(100dvh-112px)] min-h-[calc(100dvh-112px)] lg:h-[850px] lg:min-h-0 w-full rounded-md overflow-hidden border border-secondary relative bg-surface flex flex-col"
          >
            {(() => {
              const activeItem = displayedListings.find(
                (l) => l.id === selectedPostId || l.id === selectedBuildingId
              );

              if (!activeItem) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-secondary text-xs p-6 gap-2">
                    <svg className="w-8 h-8 opacity-40 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Chọn một mục để xem bản xem trước.</span>
                  </div>
                );
              }

              return (
                <div className="flex-1 flex flex-col h-full bg-surface">
                  {/* Header Bar */}
                  <div className="px-4 py-3 border-b border-secondary/20 bg-neutral flex items-center justify-between gap-3 shrink-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-sm text-primary truncate">
                        {activeItem.title}
                      </h3>
                      <p className="text-[11px] text-secondary truncate">
                        {activeItem.extracted_data?.gender_preference} · {activeItem.published_at}
                      </p>
                    </div>
                    {activeItem.source_url && (
                      <a
                        href={activeItem.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-md inline-flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                      >
                        <span>Mở liên kết</span>
                        <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Embed Iframe / Preview Container */}
                  <div className="flex-1 w-full h-full relative bg-white overflow-hidden flex flex-col">
                    {activeItem.source_url ? (
                      <iframe
                        key={activeItem.source_url}
                        src={activeItem.source_url}
                        title={activeItem.title}
                        className="w-full flex-1 border-0"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center text-center bg-surface max-w-lg mx-auto">
                        <h2 className="text-base sm:text-lg font-bold text-primary mb-2">
                          {activeItem.title}
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-secondary mb-4">
                          {activeItem.extracted_data?.gender_preference} · {activeItem.published_at}
                        </p>
                        <p className="text-xs sm:text-sm text-primary/90 leading-relaxed">
                          {activeItem.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuildingSearchTab(props: BuildingSearchTabProps) {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-secondary text-xs">
          Đang tải...
        </div>
      }
    >
      <BuildingSearchTabContent {...props} />
    </Suspense>
  );
}
