import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HandwritingCard from "@/components/HandwritingCard";
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Layers,
  Activity,
  Award,
  BookOpen,
  Compass,
  Database,
  Cpu,
  BarChart3,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6F0]">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-16 sm:space-y-24">
        {/* HERO SECTION */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-14">
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1E6] border border-[#F0DDD1] text-xs font-semibold text-[#B3543D]">
              <span className="w-2 h-2 rounded-full bg-[#FF7A5C] animate-pulse" />
              <span>Product Designer & AI-Native Builder</span>
              <span className="text-[#BFAAA5]">•</span>
              <span className="text-[#7A6863]">Hanoi & HCMC</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4A3A35] tracking-tight leading-[1.15]">
              Designing high-signal interfaces powered by{" "}
              <span className="text-[#FF7A5C] relative inline-block underline decoration-[#FF9A85]/50 decoration-wavy decoration-2">
                telemetry & AI
              </span>
              .
            </h1>

            <p className="text-sm sm:text-base text-[#7A6863] leading-relaxed max-w-xl">
              I reconstruct user mental models from behavioral telemetry, reduce cognitive load through disciplined Information Architecture, and ship production-ready interfaces with AI-native workflows.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs font-mono text-[#7A6863]">
              <span className="px-3 py-1 rounded-lg bg-white border border-[#F0DDD1] flex items-center gap-1.5 shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 text-[#FF7A5C]" />
                <strong>+630%</strong> CTA Funnel Lift
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-[#F0DDD1] flex items-center gap-1.5 shadow-2xs">
                <Database className="w-3.5 h-3.5 text-[#FF7A5C]" />
                <strong>12,740+</strong> Ingested Posts
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-[#F0DDD1] flex items-center gap-1.5 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-[#FF7A5C]" />
                <strong>Q1 AI Paper</strong> Published
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                href="/work/nhaminhbach"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A5C] hover:bg-[#E86547] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#FF7A5C]/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Read Nhaminhbach Case Study</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://nhaminhbach.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF1E6] border border-[#F0DDD1] text-xs sm:text-sm font-semibold text-[#4A3A35] transition-all"
              >
                <span>Live Website</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Handwriting Signature Card */}
          <div className="flex-shrink-0">
            <HandwritingCard className="w-[280px] sm:w-[320px]" />
          </div>
        </section>

        {/* FEATURED WORK & CASE STUDIES */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#F0DDD1] pb-4">
            <div>
              <span className="text-xs font-mono text-[#FF7A5C] uppercase tracking-wider font-semibold">
                01 / Portfolio Highlights
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3A35] tracking-tight mt-1">
                Featured Product & Systems Work
              </h2>
            </div>
            <p className="text-xs text-[#BFAAA5] font-mono">
              Empirical AI • PropTech • Agent Architectures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* FLAGSHIP: NHAMINHBACH */}
            <div className="md:col-span-12 rounded-2xl bg-white border border-[#F0DDD1] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE5D9] text-[#B3543D]">
                    Flagship Case Study
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF1E6] text-[#7A6863] border border-[#F0DDD1]">
                    PropTech • 0-to-1 MVP
                  </span>
                </div>
                <div className="text-xs font-mono text-[#BFAAA5]">
                  Shipped in 3 weeks • Live Production
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4A3A35] group-hover:text-[#FF7A5C] transition-colors">
                    Nhaminhbach: Spatial Housing Intelligence & Telemetry-Driven UX
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A6863] leading-relaxed">
                    Designed and built a full-stack rental discovery platform solving fragmented social housing posts. Layered 12,740+ listings across 1,053 PostGIS buildings, optimized conversion through raw HogQL telemetry, and eliminated unvoiced friction with Poka-Yoke error prevention.
                  </p>

                  {/* Highlights Bullet Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#7A6863]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7A5C] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Gulf of Execution Fix:</strong> Outbound CTR lifted from 10% to 73% via high-contrast action triggers.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7A5C] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Data-Ink Ratio (Tufte):</strong> Killed redundant title clutter to prioritize actionable room specs.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7A5C] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero-State Poka-Yoke:</strong> 1-click &apos;+1km radius&apos; fallback recovering empty filter states.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7A5C] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Dan Saffer Micro-interactions:</strong> URL <code className="text-[10px] font-mono bg-[#FFF1E6] px-1 rounded">&lt;-&gt;</code> State <code className="text-[10px] font-mono bg-[#FFF1E6] px-1 rounded">&lt;-&gt;</code> DB parity with CLS = 0.
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/work/nhaminhbach"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A3A35] hover:bg-[#FF7A5C] text-white text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Explore Interactive Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href="https://nhaminhbach.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF1E6] hover:bg-[#FFE5D9] text-[#4A3A35] text-xs font-semibold transition-all border border-[#F0DDD1]"
                    >
                      <span>Visit nhaminhbach.com</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Visual Telemetry Card */}
                <div className="lg:col-span-5 bg-[#FDF6F0] rounded-xl p-5 border border-[#F0DDD1] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A6863] border-b border-[#F0DDD1] pb-2">
                    <span>Live PostHog Telemetry</span>
                    <span className="text-[#FF7A5C] font-bold">572 Inspections</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7A6863]">Passive &apos;Source:&apos; Link CTR</span>
                      <span className="font-mono font-bold text-[#BFAAA5]">10.0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#BFAAA5] h-2 rounded-full w-[10%]" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[#4A3A35] font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#FF7A5C]" />
                        <span>Action Button CTR</span>
                      </span>
                      <span className="font-mono font-bold text-[#FF7A5C]">73.0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#FF7A5C] h-2.5 rounded-full w-[73%]" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#F0DDD1] text-[11px] text-[#7A6863] leading-relaxed">
                    💡 <em>“User-situation-first, not heuristics-first. Reconstructing the mental model unvoiced friction and iterating with data.”</em>
                  </div>
                </div>
              </div>
            </div>

            {/* PROJECT 2: Q1 CARDIOVASCULAR AI RESEARCH */}
            <div className="md:col-span-6 rounded-2xl bg-white border border-[#F0DDD1] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE5D9] text-[#B3543D]">
                    Q1 Journal Co-Authored Paper
                  </span>
                  <span className="text-xs font-mono text-[#BFAAA5]">BK.AI Lab</span>
                </div>
                <h4 className="text-lg font-bold text-[#4A3A35]">
                  Cardiovascular Anomaly Detection via Contrastive Deep Learning
                </h4>
                <p className="text-xs text-[#7A6863] leading-relaxed">
                  Conducted first-principles AI research on 12-lead ECG signals using ResNet and contrastive representation learning. Proves mathematical hygiene, rigorous ablation testing, and empirical discipline beyond prompt wrappers.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0DDD1] flex items-center justify-between text-xs font-mono text-[#7A6863]">
                <span>Data Science & AI • HUST</span>
                <span className="text-[#FF7A5C] font-semibold">Empirical Rigor</span>
              </div>
            </div>

            {/* PROJECT 3: SEEKWELL (ASEAN DSE 2025 NATIONAL CHAMPION) */}
            <div className="md:col-span-6 rounded-2xl bg-white border border-[#F0DDD1] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1E6] text-[#4A3A35] border border-[#F0DDD1]">
                    National Champion & Regional Finalist
                  </span>
                  <span className="text-xs font-mono text-[#BFAAA5]">ASEAN DSE 2025</span>
                </div>
                <h4 className="text-lg font-bold text-[#4A3A35]">
                  SeekWell: Spatial Environmental Analytics & Edge Vision
                </h4>
                <p className="text-xs text-[#7A6863] leading-relaxed">
                  Unified multi-dimensional climate analytics with edge Computer Vision. Honored as Vietnam National Champion and represented Vietnam at the ASEAN Data Science Explorers regional finals.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0DDD1] flex items-center justify-between text-xs font-mono text-[#7A6863]">
                <a
                  href="https://dantri.com.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#FF7A5C] hover:underline"
                >
                  <span>Press Coverage (Dân trí)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <span className="text-[#7A6863]">Spatial Data Layering</span>
              </div>
            </div>

            {/* PROJECT 4: CORETEXT AGENT ARCHITECTURES */}
            <div className="md:col-span-12 rounded-2xl bg-[#FFF1E6]/60 border border-[#F0DDD1] p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#4A3A35] text-white">
                      Graduation Thesis
                    </span>
                    <span className="text-xs font-mono text-[#7A6863]">
                      Autonomous Coding Agent Systems
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#4A3A35]">
                    Coretext: File-Native Context Routing for Autonomous LLM Agents
                  </h4>
                  <p className="text-xs text-[#7A6863] max-w-2xl">
                    Architected deterministic context discovery mechanisms, progressive disclosure prompts, and multi-agent coordination protocols to eliminate LLM hallucination and context bloat.
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs font-mono px-3 py-2 rounded-xl bg-white border border-[#F0DDD1] text-[#4A3A35]">
                  <strong>AI-Native Systems</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESIGN PHILOSOPHY / HOW I WORK */}
        <section className="space-y-8">
          <div className="border-b border-[#F0DDD1] pb-4">
            <span className="text-xs font-mono text-[#FF7A5C] uppercase tracking-wider font-semibold">
              02 / Design Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3A35] tracking-tight mt-1">
              How I Design & Build Products
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#F0DDD1] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE5D9] text-[#FF7A5C] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#4A3A35]">
                1. Information Over Decoration
              </h3>
              <p className="text-xs text-[#7A6863] leading-relaxed">
                The hardest design problem is density without cognitive overload. Reconstructing mental models dictates what surfaces first, what is grouped, and what stays hidden until needed. Visual polish comes last.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#F0DDD1] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE5D9] text-[#FF7A5C] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#4A3A35]">
                2. Telemetry-Driven Iteration
              </h3>
              <p className="text-xs text-[#7A6863] leading-relaxed">
                We are data-driven, not opinion-driven. Writing direct HogQL queries in PostHog reveals rage-clicks, unvoiced drop-offs, and friction points before users ever submit a support ticket.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#F0DDD1] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE5D9] text-[#FF7A5C] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#4A3A35]">
                3. AI-Native & Code-Complete
              </h3>
              <p className="text-xs text-[#7A6863] leading-relaxed">
                Using Claude as a peer with systematic design tokens (<code className="font-mono text-[11px] bg-[#FFF1E6] px-1 rounded">DESIGN.md</code>). Designing every state: empty, loading, error, disabled, active, and URL state parity.
              </p>
            </div>
          </div>
        </section>

        {/* 5-ACT STORYTELLING NARRATIVE */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#FFF1E6]/70 border border-[#F0DDD1] space-y-6">
          <div className="border-b border-[#F0DDD1] pb-3">
            <span className="text-xs font-mono text-[#FF7A5C] uppercase tracking-wider font-semibold">
              03 / Evolution Arc
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3A35] tracking-tight mt-1">
              From Empirical AI Research to Telemetry-Driven Product Design
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs text-[#7A6863]">
            <div className="p-3.5 bg-white rounded-xl border border-[#F0DDD1] space-y-1.5">
              <div className="font-mono font-bold text-[#FF7A5C]">ACT 1</div>
              <div className="font-semibold text-[#4A3A35]">Empirical AI</div>
              <p className="text-[11px] leading-relaxed">HUST Data Science & AI; contrastive ECG research at BK.AI (Q1 publication).</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#F0DDD1] space-y-1.5">
              <div className="font-mono font-bold text-[#FF7A5C]">ACT 2</div>
              <div className="font-semibold text-[#4A3A35]">Production Delivery</div>
              <p className="text-[11px] leading-relaxed">Fullstack Clinic Management System (React, TS, FastAPI, Postgres).</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#F0DDD1] space-y-1.5">
              <div className="font-mono font-bold text-[#FF7A5C]">ACT 3</div>
              <div className="font-semibold text-[#4A3A35]">First Fusion</div>
              <p className="text-[11px] leading-relaxed">SeekWell: Computer Vision + spatial climate analytics (ASEAN DSE Champion).</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#F0DDD1] space-y-1.5">
              <div className="font-mono font-bold text-[#FF7A5C]">ACT 4</div>
              <div className="font-semibold text-[#4A3A35]">Deep Systems</div>
              <p className="text-[11px] leading-relaxed">Coretext: File-native context routing thesis for autonomous coding agents.</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#F0DDD1] space-y-1.5">
              <div className="font-mono font-bold text-[#FF7A5C]">ACT 5</div>
              <div className="font-semibold text-[#4A3A35]">Product Frontier</div>
              <p className="text-[11px] leading-relaxed">Nhaminhbach: 0-to-1 PropTech MVP with live telemetry-driven UX deltas.</p>
            </div>
          </div>
        </section>

        {/* SUBSTACK & WRITING */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-[#F0DDD1]">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-mono text-[#BFAAA5] uppercase">Reflections & Notes</span>
            <h3 className="text-lg font-bold text-[#4A3A35]">Read my thoughts on Substack</h3>
            <p className="text-xs text-[#7A6863]">
              Essays on software engineering, product design heuristics, and AI-native workflows.
            </p>
          </div>
          <a
            href="https://bnmbanhmi.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF1E6] hover:bg-[#FFE5D9] text-[#4A3A35] text-xs font-semibold border border-[#F0DDD1] transition-all"
          >
            <span>Visit Substack</span>
            <ArrowUpRight className="w-4 h-4 text-[#FF7A5C]" />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
