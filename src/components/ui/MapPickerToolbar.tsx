'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export interface MapPickerToolbarProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

export default function MapPickerToolbar({
  active,
  children,
  className = '',
}: MapPickerToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || typeof window === 'undefined' || window.innerWidth >= 1024) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      toolbarRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={toolbarRef}
      data-testid="map-picker-toolbar"
      data-map-picker-controls
      className={['lg:hidden scroll-mt-16 pt-3 pb-1.5 px-0.5 mb-1', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
