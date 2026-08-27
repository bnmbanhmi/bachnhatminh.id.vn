import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  return (
    <header className="w-full bg-surface/95 backdrop-blur-md border-b border-secondary/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand Link */}
        <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
          <BrandLogo />
        </div>
      </div>
    </header>
  );
}
