import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-secondary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-secondary font-sans">
        {/* Brand & Mission */}
        <div className="flex flex-col items-start gap-2 max-w-sm">
          <BrandLogo />
          <p className="text-secondary/60 text-[11px] font-space-grotesk">
            © 2026 Bạch Nhật Minh. All rights reserved.
          </p>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-2">
          {/* GitHub */}
          <a
            href="https://github.com/bnmbanhmi"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub (bnmbanhmi)"
            className="w-8 h-8 rounded-md border border-secondary bg-surface hover:bg-neutral flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/bachnhatminh"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn (in/bachnhatminh)"
            className="w-8 h-8 rounded-md border border-secondary bg-surface hover:bg-neutral flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/bnmbanhmi"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook (bnmbanhmi)"
            className="w-8 h-8 rounded-md border border-secondary bg-surface hover:bg-neutral flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:bach.n.minh@gmail.com"
            title="Email (bach.n.minh@gmail.com)"
            className="w-8 h-8 rounded-md border border-secondary bg-surface hover:bg-neutral flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
