'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BuildingSearchTab from '@/components/tabs/BuildingSearchTab';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') || 'projects';
  const searchMode: SearchMode =
    rawTab === 'achievements'
      ? 'achievements'
      : rawTab === 'education'
      ? 'education'
      : 'projects';

  const searchTabOptions = getSearchTabOptions();

  const handleTabChange = (mode: SearchMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', mode);
    params.delete('post');
    params.delete('building');
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 w-full flex-1 flex flex-col py-6 gap-4">
        {/* Header Title & Clean Search Tabs Switcher */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
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
          <BuildingSearchTab showSearchBar={false} />
        </div>
      </main>

      <Footer />
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
