import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  return (
    <header className="w-full bg-surface/95 backdrop-blur-md border-b border-secondary/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand Link */}
        <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
          <BrandLogo />
        </div>

        {/* Social Channels */}
        <div className="flex items-center gap-2">
          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/bachnhatminh"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn (in/bachnhatminh)"
            className="w-8 h-8 rounded-md border border-secondary/30 bg-surface hover:bg-neutral flex items-center justify-center text-primary hover:text-tertiary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:bach.n.minh@gmail.com"
            title="Email (bach.n.minh@gmail.com)"
            className="w-8 h-8 rounded-md border border-secondary/30 bg-surface hover:bg-neutral flex items-center justify-center text-primary hover:text-tertiary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
