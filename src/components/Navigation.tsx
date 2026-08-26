"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Nhaminhbach Case Study", href: "/work/nhaminhbach" },
    { label: "Substack", href: "https://bnmbanhmi.substack.com", external: true },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FDF6F0]/85 border-b border-[#F0DDD1]/70 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-medium text-[#4A3A35] hover:text-[#FF7A5C] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF9A85] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight leading-none text-[#4A3A35]">
              Bach Nhat Minh
            </span>
            <span className="text-[11px] text-[#BFAAA5] font-mono leading-tight">
              @bnmbanhmi
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#7A6863] hover:text-[#FF7A5C] hover:bg-[#FFF1E6] transition-all"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#FF7A5C] text-white shadow-sm shadow-[#FF7A5C]/20"
                    : "text-[#7A6863] hover:text-[#FF7A5C] hover:bg-[#FFF1E6]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <a
            href="mailto:contact@nhaminhbach.com"
            className="ml-2 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#4A3A35] text-[#FDF6F0] hover:bg-[#FF7A5C] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contact</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
