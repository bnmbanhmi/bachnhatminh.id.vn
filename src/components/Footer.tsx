import Link from "next/link";
import { ArrowUpRight, Mail, Globe, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#F0DDD1] bg-[#FFF1E6]/40 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 font-semibold text-[#4A3A35]">
            <span>Bach Nhat Minh</span>
            <span className="text-[#FF7A5C]">•</span>
            <span className="text-xs font-mono text-[#BFAAA5]">bachnhatminh.id.vn</span>
          </div>
          <p className="text-xs text-[#7A6863] mt-1 max-w-sm">
            Product Designer & AI-Native Interface Builder. Bridging telemetry, heuristics, and production engineering.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-[#7A6863]">
          <a
            href="https://github.com/bnmbanhmi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#FF7A5C] transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <a
            href="https://bnmbanhmi.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#FF7A5C] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Substack</span>
          </a>
          <a
            href="https://nhaminhbach.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#FF7A5C] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Nhaminhbach</span>
          </a>
          <a
            href="mailto:contact@nhaminhbach.com"
            className="flex items-center gap-1 hover:text-[#FF7A5C] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#F0DDD1]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#BFAAA5]">
        <span>© {new Date().getFullYear()} Bach Nhat Minh. Designed with empathy, built with code.</span>
        <span className="mt-2 sm:mt-0 font-mono">Hanoi & Ho Chi Minh City, Vietnam</span>
      </div>
    </footer>
  );
}
