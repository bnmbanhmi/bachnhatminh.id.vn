import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TeardownWidget from "@/components/TeardownWidget";
import PokaYokeWidget from "@/components/PokaYokeWidget";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  Compass,
  Database,
  Eye,
  ShieldAlert,
  Code2,
  Cpu,
  Smartphone,
  Gauge,
  Workflow,
  Search,
} from "lucide-react";

export const metadata = {
  title: "Nhaminhbach Case Study | Bach Nhat Minh",
  description: "Spatial Housing Intelligence & Telemetry-Driven UX Case Study by Bach Nhat Minh.",
};

export default function NhaminhbachCaseStudy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6F0]">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-12 sm:space-y-16">
        {/* BACK LINK & BREADCRUMB */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6863] hover:text-[#FF7A5C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio Overview</span>
          </Link>
        </div>

        {/* HERO / CASE STUDY HEADER */}
        <section className="space-y-4 border-b border-[#F0DDD1] pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE5D9] text-[#B3543D]">
              Product Design & Telemetry Case Study
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF1E6] text-[#7A6863] border border-[#F0DDD1]">
              0-to-1 PropTech MVP
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4A3A35] tracking-tight leading-[1.15]">
            Nhaminhbach: Spatial Housing Intelligence & Telemetry-Driven UX
          </h1>

          <p className="text-base sm:text-lg text-[#7A6863] leading-relaxed">
            How I designed a spatial rental discovery platform from 0-to-1 in 3 weeks, ingested 12,740+ listings across 1,053 PostGIS clusters, and used PostHog HogQL telemetry to lift outbound contact conversion from 10% to 73%.
          </p>

          {/* METADATA CHIPS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#F0DDD1]">
              <div className="text-[11px] font-mono text-[#BFAAA5] uppercase">Role</div>
              <div className="font-bold text-[#4A3A35] mt-0.5">Product Designer & Builder</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#F0DDD1]">
              <div className="text-[11px] font-mono text-[#BFAAA5] uppercase">Timeline</div>
              <div className="font-bold text-[#4A3A35] mt-0.5">3 Weeks (0-to-1)</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#F0DDD1]">
              <div className="text-[11px] font-mono text-[#BFAAA5] uppercase">Key Metric</div>
              <div className="font-bold text-[#FF7A5C] mt-0.5">+630% Outbound Lift</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#F0DDD1]">
              <div className="text-[11px] font-mono text-[#BFAAA5] uppercase">Live Demo</div>
              <a
                href="https://nhaminhbach.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#FF7A5C] hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>nhaminhbach.com</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* 1. EXECUTIVE SUMMARY & THE PROBLEM */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4A3A35] text-white flex items-center justify-center text-xs font-mono font-bold">
              01
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35]">
              The Core Friction: Fragmented Social Housing
            </h2>
          </div>

          <p className="text-sm text-[#7A6863] leading-relaxed">
            In Vietnam, the primary housing marketplace for young professionals and students is not legacy classified portals (which suffer from broker spam and fake listings), but unstructured social media channels (Threads, Facebook groups).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#F0DDD1] space-y-2">
              <div className="font-bold text-[#B3543D] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>The User Frustrations (Unvoiced):</span>
              </div>
              <ul className="space-y-1.5 text-[#7A6863] list-disc list-inside leading-relaxed">
                <li>No spatial context (renters must cross-reference Google Maps manually).</li>
                <li>Misleading & redundant post titles hiding actual pricing and deposit rules.</li>
                <li>Extreme cognitive load scanning through thousands of repetitive feeds.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF1E6] border border-[#F0DDD1] space-y-2">
              <div className="font-bold text-[#4A3A35] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF7A5C]" />
                <span>The Design Solution:</span>
              </div>
              <ul className="space-y-1.5 text-[#7A6863] list-disc list-inside leading-relaxed">
                <li>Inverted pyramid Information Architecture for spatial exploration.</li>
                <li>Elimination of synthetic title noise (Edward Tufte Data-Ink ratio).</li>
                <li>Telemetry-driven funnel optimization (10% $\rightarrow$ 73% CTA lift).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. INFORMATION ARCHITECTURE & MULTI-DIMENSIONAL DATA LAYERING */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4A3A35] text-white flex items-center justify-center text-xs font-mono font-bold">
              02
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35]">
              Information Architecture & Multi-Dimensional Layering
            </h2>
          </div>

          <p className="text-sm text-[#7A6863] leading-relaxed">
            Flexspace evaluates candidates on taking dense, multi-dimensional datasets (bookings $\times$ spaces $\times$ times $\times$ prices $\times$ policies) and deciding what to show, what to hide, and how to layer it.
            In Nhaminhbach, the challenge was layering <strong>GPS Coordinates $\times$ Price $\times$ Move-in Date $\times$ Host Credibility $\times$ Freshness</strong> without overwhelming the mobile user.
          </p>

          {/* Inverted Pyramid Diagram */}
          <div className="p-5 rounded-2xl bg-white border border-[#F0DDD1] space-y-4">
            <h3 className="text-xs font-mono uppercase text-[#BFAAA5] font-semibold">
              Hierarchical Faceted Navigation (Inverted Pyramid)
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
              <div className="w-full sm:w-auto p-2.5 rounded-lg bg-[#FFE5D9] text-[#B3543D] font-bold text-center">
                1. City (HN / HCM)
              </div>
              <span className="text-[#BFAAA5]">→</span>
              <div className="w-full sm:w-auto p-2.5 rounded-lg bg-[#FFF1E6] text-[#7A6863] font-semibold text-center">
                2. Category (Rent / Roommate)
              </div>
              <span className="text-[#BFAAA5]">→</span>
              <div className="w-full sm:w-auto p-2.5 rounded-lg bg-[#FFF1E6] text-[#7A6863] font-semibold text-center">
                3. Spatial Pin & Card
              </div>
              <span className="text-[#BFAAA5]">→</span>
              <div className="w-full sm:w-auto p-2.5 rounded-lg bg-[#4A3A35] text-white font-bold text-center">
                4. Terminal Action
              </div>
            </div>

            <p className="text-xs text-[#7A6863] leading-relaxed pt-2">
              Implemented <strong>Ben Shneiderman&apos;s Visual Information Seeking Mantra</strong>: <em>&quot;Overview first, zoom and filter, then details-on-demand.&quot;</em>
              Both the feed list and Leaflet map derive reactively from the same coordinated dataset, preventing desynchronization.
            </p>
          </div>

          {/* Tufte Data-Ink Rule Callout */}
          <div className="p-5 rounded-2xl bg-[#FFF1E6]/80 border border-[#F0DDD1] space-y-3">
            <h3 className="text-sm font-bold text-[#4A3A35] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF7A5C]" />
              <span>Killing the Synthetic Classified Title (Data-Ink Ratio Optimization)</span>
            </h3>
            <p className="text-xs text-[#7A6863] leading-relaxed">
              Traditional real estate sites force users to read repetitive titles like <em>&quot;CHÍNH CHỦ CHO THUÊ PHÒNG TRỌ GIÁ RẺ QUẬN BÌNH THẠNH FULL NỘI THẤT&quot;</em>.
              By stripping away synthetic title clutter entirely, we maximized Edward Tufte&apos;s <strong>Data-Ink Ratio</strong> and applied <strong>Miller&apos;s Law chunking</strong>: immediately exposing high-precision structured tokens (District, Exact Price, Move-in Date, Host Verified Tag) in the primary glance zone.
            </p>
          </div>
        </section>

        {/* 3. INTERACTIVE TELEMETRY TEARDOWNS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4A3A35] text-white flex items-center justify-center text-xs font-mono font-bold">
              03
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35]">
              Interactive Telemetry Teardown #1: The Gulf of Execution
            </h2>
          </div>

          <p className="text-sm text-[#7A6863] leading-relaxed">
            During our initial launch with 572 listing inspections, we noticed high dwell time but low outbound landlord contact (10.0% CTR).
            Analyzing user recordings and mental models revealed that users perceived <code className="px-1 py-0.5 bg-white border border-[#F0DDD1] rounded font-mono text-[#B3543D]">Nguồn: Threads</code> as copyright citation rather than a functional contact pathway.
          </p>

          {/* EMBEDDED INTERACTIVE TEARDOWN */}
          <TeardownWidget />

          <div className="p-4 rounded-xl bg-white border border-[#F0DDD1] space-y-2 text-xs">
            <div className="font-bold text-[#4A3A35] font-mono flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#FF7A5C]" />
              <span>PostHog HogQL Query Used to Prove Funnel Lift:</span>
            </div>
            <pre className="p-3 bg-[#2D2421] text-[#FFE5D9] rounded-lg overflow-x-auto text-[11px] font-mono">
{`SELECT 
    properties.$current_url AS listing_url,
    countIf(event = 'listing_inspect') AS total_inspections,
    countIf(event = 'outbound_landlord_contact') AS total_outbounds,
    round(total_outbounds / total_inspections * 100, 1) AS conversion_rate
FROM events 
WHERE timestamp >= now() - INTERVAL 14 DAY
GROUP BY listing_url
ORDER BY total_inspections DESC`}
            </pre>
          </div>
        </section>

        {/* 4. POKA-YOKE & ZERO-STATE RECOVERY */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4A3A35] text-white flex items-center justify-center text-xs font-mono font-bold">
              04
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35]">
              Telemetry Teardown #2: Poka-Yoke & Unvoiced Friction
            </h2>
          </div>

          <p className="text-sm text-[#7A6863] leading-relaxed">
            Marketplace users frequently encounter zero-result search dead-ends when setting strict filters.
            Rather than showing a generic &quot;No results found&quot; error dialog (which causes abandonment), we engineered the <code className="px-1 py-0.5 bg-white border border-[#F0DDD1] rounded font-mono text-[#B3543D]">ZeroStateRecoveryBox</code> with 1-click heuristic expansion triggers.
          </p>

          {/* EMBEDDED POKA YOKE WIDGET */}
          <PokaYokeWidget />
        </section>

        {/* 5. MICRO-INTERACTIONS & STATE PARITY */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4A3A35] text-white flex items-center justify-center text-xs font-mono font-bold">
              05
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35]">
              Dan Saffer Micro-interactions & State Parity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-white border border-[#F0DDD1] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#4A3A35]">
                <Smartphone className="w-4 h-4 text-[#FF7A5C]" />
                <span>Mobile Map-Picking Interaction</span>
              </div>
              <p className="text-[#7A6863] leading-relaxed">
                Applied <strong>Ben Shneiderman&apos;s Spatial Direct Manipulation</strong>: panning the map moves terrain under a static center reticle with a 240px dashed radius overlay. This completely eliminates mobile &quot;fat finger&quot; touch ambiguity (Fitts&apos;s Law).
              </p>
              <div className="pt-2 border-t border-[#F0DDD1] text-[11px] font-mono text-[#BFAAA5]">
                Gesture Isolation: `overflow: hidden` on body prevents scroll traps.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#F0DDD1] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#4A3A35]">
                <Workflow className="w-4 h-4 text-[#FF7A5C]" />
                <span>URL &lt;-&gt; Component &lt;-&gt; DB State Parity</span>
              </div>
              <p className="text-[#7A6863] leading-relaxed">
                Every filter combination, active coordinate, and inspected building is serialized into URL query params (<code className="font-mono text-[10px] bg-[#FFF1E6] px-1 rounded">?lat=...&amp;tab=...&amp;building=...</code>).
                Enables instant browser back/forward history recovery (`popstate`) with zero desynchronization bugs.
              </p>
              <div className="pt-2 border-t border-[#F0DDD1] text-[11px] font-mono text-[#BFAAA5]">
                Cumulative Layout Shift (CLS) = 0.00 across all view toggles.
              </div>
            </div>
          </div>
        </section>

        {/* 6. AI-NATIVE DESIGN SYSTEM */}
        <section className="p-6 rounded-2xl bg-[#FFF1E6] border border-[#F0DDD1] space-y-4">
          <div className="flex items-center gap-2 text-[#4A3A35] font-bold text-base sm:text-lg">
            <Cpu className="w-5 h-5 text-[#FF7A5C]" />
            <span>AI-Legible Design System (DESIGN.md)</span>
          </div>

          <p className="text-xs sm:text-sm text-[#7A6863] leading-relaxed">
            Flexspace highlighted a critical bottleneck: <em>&quot;The design system isn&apos;t documented well enough for Claude to pick the right component.&quot;</em>
          </p>

          <p className="text-xs text-[#7A6863] leading-relaxed">
            In Nhaminhbach, we codified all layout tokens, color scales, 4px/8px radii, state variations (`empty`, `loading`, `error`, `disabled`, `active`), and typography tokens into a single declarative <code className="px-1.5 py-0.5 bg-white rounded font-mono text-[#B3543D]">DESIGN.md</code>.
            This allowed Claude to scaffold state-complete React components with 100% design fidelity and zero ad-hoc styling drift.
          </p>
        </section>

        {/* 7. LIVE PRODUCT FLOW CALLOUT */}
        <section className="p-8 rounded-2xl bg-white border-2 border-[#FF7A5C]/40 shadow-md space-y-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#FF7A5C] uppercase font-bold">
                End-to-End Interactive Flow
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#4A3A35] mt-1">
                Experience Nhaminhbach Live in Production
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6863] mt-1 max-w-xl">
                Test the omnibox spatial search, mobile map reticle, segmented filters, and real-time state synchronization live on the web.
              </p>
            </div>

            <a
              href="https://nhaminhbach.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A5C] hover:bg-[#E86547] text-white text-sm font-bold shadow-md shadow-[#FF7A5C]/30 transition-all transform hover:-translate-y-0.5 flex-shrink-0"
            >
              <span>Launch nhaminhbach.com</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
