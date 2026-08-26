"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface HandwritingCardProps {
  className?: string;
}

export default function HandwritingCard({ className = "" }: HandwritingCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const strokes = [
    "m-1", "m-2", "m-3", // m
    "i-1", "i-2",        // i
    "n-1", "n-2",        // n
    "h1-1", "h1-2",      // h
    "b-1", "b-2",        // b
    "a-1", "a-2",        // a
    "c-1",               // c
    "h2-1", "h2-2",      // h
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

    // Constant linear speed: constant milliseconds per pixel across all strokes
    const msPerUnit = 11;
    const strokeGap = 20;
    let cumDelay = 0;

    strokes.forEach((id) => {
      const path = svgRef.current?.querySelector<SVGPathElement>(`#${id}`);
      if (!path) return;

      const len = path.getTotalLength();
      // Constant velocity across all curves and lines
      const dur = id === "i-2" ? 80 : Math.max(80, Math.round(len * msPerUnit));

      const timer = setTimeout(() => {
        if (path) {
          path.style.transition = `stroke-dashoffset ${dur}ms linear`;
          path.style.strokeDashoffset = "0";
        }
      }, cumDelay);

      timersRef.current.push(timer);

      // Subtle natural pen-lift pause between "minh" and "bach"
      const extraGap = id === "h1-2" ? 120 : 0;
      cumDelay += dur + strokeGap + extraGap;
    });
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(animateWrite, 300);
    return () => {
      clearTimeout(startTimer);
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [animateWrite]);

  return (
    <div
      id="helloCard"
      onClick={animateWrite}
      onMouseEnter={animateWrite}
      className={`w-[300px] bg-[#FFF1E6] rounded-[15px] overflow-hidden shadow-[0_4px_15px_rgba(122,104,99,0.1)] cursor-pointer select-none transition-all duration-300 hover:shadow-[0_6px_20px_rgba(122,104,99,0.15)] ${className}`}
    >
      <div className="bg-[#FF9A85] text-white text-center pt-[14px] pb-[10px] px-2">
        <span className="block text-[1.3rem] font-[800] tracking-[2px] uppercase leading-[1.2]">
          Hello
        </span>
        <span className="block text-[0.7rem] font-[500] tracking-[1.5px] uppercase mt-[2px] opacity-90">
          my name is
        </span>
      </div>

      <div className="py-[18px] px-0 flex justify-center items-center min-h-[80px] bg-[#FFF1E6]">
        <svg
          ref={svgRef}
          className="handwriting-svg w-[215px] h-auto"
          viewBox="0 0 220 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(6, 0)">
            {/* minh */}
            {/* m: vertical, first hump, second hump */}
            <path className="name-path" id="m-1" d="M14,32 L14,56" />
            <path
              className="name-path"
              id="m-2"
              d="M14,38 C14,30 22,28 25,34 C28,40 28,42 28,42"
            />
            <path
              className="name-path"
              id="m-3"
              d="M28,42 C28,34 33,28 37,28 C41,28 42,36 42,42 L42,56"
            />
            {/* i: body, dot */}
            <path className="name-path" id="i-1" d="M51,32 L51,56" />
            <path className="name-path" id="i-2" d="M51,22 L51.5,22.5" />
            {/* n: vertical, hump */}
            <path className="name-path" id="n-1" d="M61,32 L61,56" />
            <path
              className="name-path"
              id="n-2"
              d="M61,38 C61,30 69,28 73,34 C77,40 75,56 75,56"
            />
            {/* h1: tall vertical, hump */}
            <path className="name-path" id="h1-1" d="M85,12 L85,56" />
            <path
              className="name-path"
              id="h1-2"
              d="M85,38 C85,30 93,28 97,34 C101,40 99,56 99,56"
            />

            {/* bach */}
            {/* b: tall vertical, belly */}
            <path className="name-path" id="b-1" d="M113,12 L113,56" />
            <path
              className="name-path"
              id="b-2"
              d="M113,35 C113,28 123,22 127,30 C131,38 129,48 123,52 C117,56 113,52 113,48"
            />
            {/* a: circle, tail */}
            <path
              className="name-path"
              id="a-1"
              d="M147,32 C143,28 135,28 133,35 C131,42 133,52 139,54 C145,56 149,50 147,42 L147,32"
            />
            <path className="name-path" id="a-2" d="M147,32 L147,56" />
            {/* c: open curve */}
            <path
              className="name-path"
              id="c-1"
              d="M168,34 C165,28 156,28 154,36 C152,44 154,52 160,55 C166,58 170,50 170,47"
            />
            {/* h2: tall vertical, hump */}
            <path className="name-path" id="h2-1" d="M180,12 L180,56" />
            <path
              className="name-path"
              id="h2-2"
              d="M180,38 C180,30 188,28 192,34 C196,40 194,56 194,56"
            />
          </g>
        </svg>
      </div>

      <div className="bg-[#FF9A85] h-[22px]" />
    </div>
  );
}
