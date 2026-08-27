'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BuildingSearchTab from '@/components/tabs/BuildingSearchTab';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';
import { pushHomeSearchParams } from '@/lib/home-url-state';

type SearchMode = 'projects' | 'achievements' | 'education';

function getSearchTabOptions(): SegmentedOption[] {
  return [
    {
      key: 'projects',
      label: 'Projects',
    },
    {
      key: 'achievements',
      label: 'Achievements',
    },
    {
      key: 'education',
      label: 'Education',
    },
  ];
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const rawTab = searchParams.get('tab') || 'projects';
  const searchMode: SearchMode =
    rawTab === 'achievements'
      ? 'achievements'
      : rawTab === 'education'
      ? 'education'
      : 'projects';

  const searchTabOptions = getSearchTabOptions();

  const handleTabChange = (mode: SearchMode) => {
    const params = new URLSearchParams(searchParamsKey);
    params.set('tab', mode);
    pushHomeSearchParams(params);
  };

  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-sans">
      <Navbar />

      <main
        className={`max-w-7xl mx-auto px-4 md:px-6 w-full flex-1 flex flex-col ${
          mobileViewMode === 'map' ? 'py-0 lg:py-6 gap-0 lg:gap-4' : 'py-6 gap-4'
        }`}
      >
        {/* Header Title & Clean Search Tabs Switcher */}
        <section
          className={`flex-col md:flex-row md:items-center justify-between gap-4 pb-2 ${
            mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-primary tracking-tight">
            Portfolio
          </h1>
          <SegmentedControl
            ariaLabel="Portfolio category"
            fullWidth="mobile"
            options={searchTabOptions}
            activeKey={searchMode}
            onChange={(key) => handleTabChange(key as SearchMode)}
          />
        </section>

        {/* Tab Search View Container */}
        <div className="flex-1 flex flex-col">
          <BuildingSearchTab
            showSearchBar={false}
            mobileViewMode={mobileViewMode}
            onMobileViewModeChange={setMobileViewMode}
          />
        </div>
      </main>

      <div className={mobileViewMode === 'map' ? 'hidden lg:block' : 'block'}>
        <Footer />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-secondary text-sm">
          Đang tải...
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
