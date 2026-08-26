"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface HandwritingCardProps {
  subtitle?: string;
  className?: string;
}

export default function HandwritingCard({
  subtitle = "my name is",
  className = "",
}: HandwritingCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const strokes = [
    "b-1", "b-2",       // b: vertical, then belly
    "a-1", "a-2",       // a: circle, then tail
    "n-1", "n-2",       // n: vertical, then hump
    "h-1", "h-2",       // h: vertical, then hump
    "m-1", "m-2", "m-3", // m: vertical, first hump, second hump
    "i-1", "i-2",       // i: body, then dot
  ];

  const animateWrite = useCallback(() => {
    if (!svgRef.current) return;

    // Clear any pending timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Reset stroke styles
    strokes.forEach((id) => {
      const path = svgRef.current?.querySelector<SVGPathElement>(`#${id}`);
      if (path) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        path.style.transition = "none";
      }
    });

    // Force reflow
    void svgRef.current.getBoundingClientRect();

    const drawDuration = 750;
    const strokeGap = 35;
    let cumDelay = 0;

    strokes.forEach((id) => {
      const path = svgRef.current?.querySelector<SVGPathElement>(`#${id}`);
      if (!path) return;

      const len = path.getTotalLength();
      const dur = Math.max(120, drawDuration * (len / 80));

      const timer = setTimeout(() => {
        if (path) {
          path.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          path.style.strokeDashoffset = "0";
        }
      }, cumDelay);

      timersRef.current.push(timer);
      cumDelay += dur + strokeGap;
    });
  }, []);

  useEffect(() => {
    // Initial draw on mount
    const startTimer = setTimeout(animateWrite, 300);
    return () => {
      clearTimeout(startTimer);
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [animateWrite]);

  return (
    <div
      onClick={animateWrite}
      onMouseEnter={animateWrite}
      className={`group cursor-pointer select-none rounded-2xl overflow-hidden shadow-lg shadow-[#7A6863]/10 hover:shadow-xl hover:shadow-[#7A6863]/15 transition-all duration-300 transform hover:-translate-y-1 bg-[#FFF1E6] border border-[#F0DDD1] ${className}`}
    >
      {/* Top Header Strip */}
      <div className="bg-[#FF9A85] text-white text-center py-3.5 px-4 transition-colors group-hover:bg-[#FF856D]">
        <span className="block text-xl font-extrabold tracking-[3px] uppercase leading-tight font-sans">
          Hello
        </span>
        <span className="block text-[11px] font-medium tracking-[2px] uppercase opacity-95 mt-0.5">
          {subtitle}
        </span>
      </div>

      {/* SVG Handwriting Canvas Body */}
      <div className="py-4 px-6 flex justify-center items-center min-h-[90px] bg-[#FFF1E6] group-hover:bg-[#FFF5ED] transition-colors">
        <svg
          ref={svgRef}
          className="handwriting-svg w-52 max-w-full h-auto"
          viewBox="0 0 220 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(31, 0)">
            {/* b: stroke 1 = vertical, stroke 2 = belly */}
            <path className="name-path" id="b-1" d="M12,12 L12,58" />
            <path
              className="name-path"
              id="b-2"
              d="M12,35 C12,28 22,22 26,30 C30,38 28,48 22,52 C16,56 12,52 12,48"
            />
            {/* a: stroke 1 = circle, stroke 2 = tail */}
            <path
              className="name-path"
              id="a-1"
              d="M48,32 C44,28 36,28 34,35 C32,42 34,52 40,54 C46,56 50,50 48,42 L48,32"
            />
            <path className="name-path" id="a-2" d="M48,32 L48,56" />
            {/* n: stroke 1 = vertical, stroke 2 = hump */}
            <path className="name-path" id="n-1" d="M58,32 L58,56" />
            <path
              className="name-path"
              id="n-2"
              d="M58,38 C58,30 66,28 70,34 C74,40 72,56 72,56"
            />
            {/* h: stroke 1 = tall vertical, stroke 2 = hump */}
            <path className="name-path" id="h-1" d="M82,12 L82,56" />
            <path
              className="name-path"
              id="h-2"
              d="M82,38 C82,30 90,28 94,34 C98,40 96,56 96,56"
            />
            {/* m: stroke 1 = vertical, stroke 2 = first hump, stroke 3 = second hump */}
            <path className="name-path" id="m-1" d="M106,32 L106,56" />
            <path
              className="name-path"
              id="m-2"
              d="M106,38 C106,30 114,28 116,34 C118,40 118,42 118,42"
            />
            <path
              className="name-path"
              id="m-3"
              d="M118,42 C118,34 120,28 126,28 C132,28 134,36 134,42 L134,56"
            />
            {/* i: stroke 1 = body, stroke 2 = dot */}
            <path className="name-path" id="i-1" d="M144,32 L144,56" />
            <path className="name-path" id="i-2" d="M144,22 L144.5,22.5" />
          </g>
        </svg>
      </div>

      {/* Bottom Color Accent Strip */}
      <div className="bg-[#FF9A85] h-5 transition-colors group-hover:bg-[#FF856D]" />
    </div>
  );
}
