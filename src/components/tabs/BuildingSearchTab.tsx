'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import BuildingDetailPane from '@/components/BuildingDetailPane';
import BottomSheet, { SnapState } from '@/components/ui/BottomSheet';
import { PORTFOLIO_LISTINGS } from '@/lib/portfolio-data';

export interface BuildingSearchTabProps {
  className?: string;
  showSearchBar?: boolean;
}

function BuildingSearchTabContent({
  className = '',
}: BuildingSearchTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'about';
  const postParam = searchParams.get('post') || searchParams.get('building') || null;

  const currentCategory =
    tabParam === 'products'
      ? 'products'
      : tabParam === 'experience'
      ? 'experience'
      : 'about';

  const displayedListings = useMemo(() => {
    return PORTFOLIO_LISTINGS.filter((l) => l.post_type === currentCategory);
  }, [currentCategory]);

  const [snapState, setSnapState] = useState<SnapState>('peek');

  // Building & Post Selection state directly from URL
  const selectedPostId = postParam;
  const selectedBuildingId = postParam;

  // On desktop, check if selectedPostId belongs to active tab
  const isSelectedInTab = displayedListings.some(
    (l) => l.id === selectedPostId || (l.short_id && l.short_id === selectedPostId)
  );

  // Auto-select the first listing of active tab if no valid post param in URL for this tab
  const defaultPostId = displayedListings.length > 0 ? displayedListings[0].id : null;
  const desktopSelectedId = isSelectedInTab && selectedPostId ? selectedPostId : defaultPostId;

  const handleSelectBuilding = (buildingId: string | null, postId?: string | null) => {
    const cleanId = (postId || buildingId || '').trim();
    const params = new URLSearchParams(searchParams.toString());
    if (cleanId) {
      params.set('post', cleanId);
      params.delete('building');
    } else {
      params.delete('post');
      params.delete('building');
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
    setSnapState('peek');
  };

  const hasMobileSelection = Boolean(selectedBuildingId || selectedPostId);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Main Split Layout: Left Feed / Cards, Right Detail Pane on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 lg:mt-2 min-h-[500px]">
        {/* Left Column: Feed Cards */}
        <div className="lg:col-span-4 relative flex flex-col lg:h-[850px] lg:max-h-[850px]">
          <div className="flex-1 lg:overflow-y-auto pr-1.5 flex flex-col gap-2.5">
            {displayedListings.map((list, index) => {
              const isExplicitlySelected =
                isSelectedInTab && (selectedPostId === list.id || selectedBuildingId === list.id);
              const isDefaultSelected = !isSelectedInTab && index === 0;
              return (
                <div key={list.id}>
                  <ListingCard
                    listing={list}
                    title={list.title}
                    className={
                      isExplicitlySelected
                        ? 'border-primary bg-surface'
                        : isDefaultSelected
                        ? 'lg:border-primary lg:bg-surface'
                        : ''
                    }
                    onSelect={(bId: string, pId?: string) => handleSelectBuilding(bId || list.id, pId || list.id)}
                  />
                </div>
              );
            })}
          </div>

          {/* Mobile BottomSheet Detail (Only rendered on mobile screens when user explicitly selects a post) */}
          {hasMobileSelection && (
            <div className="lg:hidden">
              <BottomSheet
                snapState={snapState}
                onSnapChange={(newSnap) => setSnapState(newSnap)}
                onClose={() => handleSelectBuilding(null)}
                peekHeight={280}
                showHandle={true}
              >
                <BuildingDetailPane
                  elasticId={selectedBuildingId || undefined}
                  postId={selectedPostId || undefined}
                  initialTab="all"
                  highlightPostId={selectedPostId || undefined}
                  onClose={() => handleSelectBuilding(null)}
                  className="h-full"
                />
              </BottomSheet>
            </div>
          )}
        </div>

        {/* Right Column: Desktop Detail Section (No peek or swipe, clean static scrollable pane) */}
        <div className="hidden lg:block lg:col-span-8 relative">
          <div className="lg:sticky lg:top-20 h-[calc(100dvh-112px)] lg:h-[850px] w-full rounded-md border border-secondary/30 bg-surface overflow-hidden flex flex-col shadow-xs">
            {desktopSelectedId ? (
              <BuildingDetailPane
                elasticId={desktopSelectedId}
                postId={desktopSelectedId}
                initialTab="all"
                highlightPostId={desktopSelectedId}
                onClose={() => handleSelectBuilding(null)}
                className="h-full"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-secondary text-xs p-6 gap-2">
                <svg className="w-8 h-8 opacity-40 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span>Select an item to view details.</span>
              </div>
            )}
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
          Loading...
        </div>
      }
    >
      <BuildingSearchTabContent {...props} />
    </Suspense>
  );
}
