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

        {/* Social / Direct Links */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
          <a
            href="https://github.com/bnmbanhmi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            GitHub
          </a>
          <span className="text-secondary/40">·</span>
          <a
            href="https://linkedin.com/in/bachnhatminh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            LinkedIn
          </a>
          <span className="text-secondary/40">·</span>
          <a
            href="mailto:bach.n.minh@gmail.com"
            className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            Email
          </a>
        </div>
      </div>
    </header>
  );
}
