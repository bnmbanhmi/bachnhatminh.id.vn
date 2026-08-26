"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, MousePointerClick, TrendingUp, Code2, Sparkles, ExternalLink } from "lucide-react";

export default function TeardownWidget() {
  const [variant, setVariant] = useState<"before" | "after">("after");
  const [clicked, setClicked] = useState(false);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-[#F0DDD1] bg-white overflow-hidden shadow-sm my-8">
      {/* Header controls */}
      <div className="bg-[#FFF1E6] px-5 py-4 border-b border-[#F0DDD1] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF7A5C] text-white">
              Interactive Teardown
            </span>
            <span className="text-xs font-mono text-[#7A6863]">
              Norman&apos;s Gulf of Execution
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#4A3A35] mt-1">
            Transforming Passive Attribution into High-Intent Action Trigger
          </h4>
        </div>

        {/* Segmented Control Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-[#F0DDD1]/80 border border-[#E8C8B8]">
          <button
            onClick={() => setVariant("before")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              variant === "before"
                ? "bg-white text-[#4A3A35] shadow-xs"
                : "text-[#7A6863] hover:text-[#4A3A35]"
            }`}
          >
            Before: Passive Text
          </button>
          <button
            onClick={() => setVariant("after")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              variant === "after"
                ? "bg-[#FF7A5C] text-white shadow-xs"
                : "text-[#7A6863] hover:text-[#4A3A35]"
            }`}
          >
            After: Direct CTA Button
          </button>
        </div>
      </div>

      {/* Interactive Display Area */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Mock Listing Card UI */}
        <div className="lg:col-span-6 bg-[#FDF6F0] rounded-xl p-5 border border-[#F0DDD1] relative">
          <div className="flex items-center justify-between text-xs text-[#BFAAA5] font-mono mb-3">
            <span>Phòng trọ studio • Quận Bình Thạnh</span>
            <span className="px-2 py-0.5 rounded bg-[#FFE5D9] text-[#B3543D] font-bold">
              3.8tr/tháng
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <h5 className="text-sm font-semibold text-[#4A3A35]">
              Căn hộ ban công thoáng mát, full nội thất, giờ giấc tự do
            </h5>
            <p className="text-xs text-[#7A6863] line-clamp-2">
              Vị trí gần ĐH Hutech, Ngoại Thương. Phòng có máy lạnh, tủ lạnh, bếp riêng, máy giặt chung sân thượng...
            </p>
          </div>

          <div className="pt-3 border-t border-[#F0DDD1] flex items-center justify-between">
            <span className="text-[11px] text-[#BFAAA5] font-mono">
              Vào ở ngay • Điện 3.8k/kWh
            </span>

            {/* THE TESTED COMPONENT */}
            {variant === "before" ? (
              <div className="text-xs text-[#7A6863]">
                <span className="text-[#BFAAA5]">Nguồn: </span>
                <a
                  href="#simulate"
                  onClick={handleCtaClick}
                  className="text-[#7A6863] underline hover:text-[#FF7A5C] transition-colors"
                >
                  Threads
                </a>
              </div>
            ) : (
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF7A5C] hover:bg-[#E86547] text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
              >
                <span>Liên hệ trực tiếp (Threads)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {clicked && (
            <div className="absolute inset-0 bg-[#4A3A35]/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-[#FF9A85] mb-2" />
              <span className="text-xs font-bold font-mono">Outbound Contact Event Captured</span>
              <span className="text-[11px] text-[#FDF6F0]/80 mt-1">
                Triggered PostHog event: `outbound_landlord_contact` with provider: &apos;threads&apos;
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Comparison & Insights */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                variant === "before"
                  ? "bg-[#FFF1E6] border-[#FF7A5C]"
                  : "bg-white border-[#F0DDD1] opacity-60"
              }`}
            >
              <div className="text-[11px] font-mono text-[#BFAAA5] uppercase">
                Passive Link CTR
              </div>
              <div className="text-2xl font-bold font-mono text-[#7A6863] mt-1">
                10.0%
              </div>
              <div className="text-[11px] text-[#BFAAA5] mt-1">
                57 clicks / 572 inspections
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border transition-all ${
                variant === "after"
                  ? "bg-[#FFE8E0] border-[#FF7A5C] ring-2 ring-[#FF7A5C]/20"
                  : "bg-white border-[#F0DDD1] opacity-60"
              }`}
            >
              <div className="text-[11px] font-mono text-[#B3543D] uppercase font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#FF7A5C]" />
                <span>Action Button CTR</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#B3543D] mt-1">
                73.0%
              </div>
              <div className="text-[11px] text-[#FF7A5C] font-semibold mt-1">
                +630% relative conversion lift
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FDF6F0] border border-[#F0DDD1] text-xs text-[#7A6863] space-y-2">
            <div className="font-semibold text-[#4A3A35] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A5C]" />
              <span>UX & Heuristic Diagnosis:</span>
            </div>
            <p className="leading-relaxed">
              Users operating under the rental search mental model expect a clear signifier for landlord contact.
              Labeling the link as <code className="px-1 py-0.5 bg-[#FFF1E6] rounded text-[#B3543D] font-mono">Nguồn: Threads</code> caused a <strong>Gulf of Execution</strong> — users perceived it as passive citation rather than a functional contact bridge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
