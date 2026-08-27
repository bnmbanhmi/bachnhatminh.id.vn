'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

export type SnapState = 'peek' | 'full';

interface DesktopBounds {
  left: number;
  width: number;
  top: number;
}

interface BottomSheetProps {
  snapState?: SnapState;
  onSnapChange?: (state: SnapState) => void;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  className?: string;
  peekHeight?: number; // Height in px for peek state (default 210)
  containerRef?: React.RefObject<HTMLElement | null>;
  topAnchorRef?: React.RefObject<HTMLElement | null>;
  showHandle?: boolean;
}

export default function BottomSheet({
  snapState: controlledSnapState,
  onSnapChange,
  children,
  headerContent,
  className = '',
  peekHeight = 210,
  containerRef,
  topAnchorRef,
  showHandle = true,
}: BottomSheetProps) {
  const [internalSnapState, setInternalSnapState] = useState<SnapState>('peek');
  const snapState = controlledSnapState !== undefined ? controlledSnapState : internalSnapState;

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);

  const updateBounds = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 1024) {
      const targetEl = containerRef?.current || sheetRef.current?.parentElement;
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        let topY = rect.top + 28;

        if (topAnchorRef?.current) {
          const anchorRect = topAnchorRef.current.getBoundingClientRect();
          topY = anchorRect.bottom + 4;
        }

        setDesktopBounds({
          left: rect.left,
          width: rect.width,
          top: Math.max(16, Math.min(window.innerHeight - peekHeight - 40, topY)),
        });
        return;
      }
    }
    setDesktopBounds(null);
  }, [containerRef, topAnchorRef, peekHeight]);

  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, { passive: true });
    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
    };
  }, [updateBounds]);

  const updateSnapState = useCallback(
    (nextState: SnapState) => {
      if (controlledSnapState === undefined) {
        setInternalSnapState(nextState);
      }
      onSnapChange?.(nextState);
    },
    [controlledSnapState, onSnapChange]
  );

  // Height map based on viewport height and top anchor bounds on desktop
  const getHeightForState = useCallback(
    (state: SnapState): number => {
      if (typeof window === 'undefined') return peekHeight;
      const isDesktop = window.innerWidth >= 1024;
      const vh = window.innerHeight;

      if (isDesktop && desktopBounds) {
        const fullH = Math.max(peekHeight + 40, vh - desktopBounds.top);
        switch (state) {
          case 'peek':
            return Math.min(peekHeight, Math.round(fullH * 0.45));
          case 'full':
            return fullH;
          default:
            return peekHeight;
        }
      }

      switch (state) {
        case 'peek':
          return Math.min(peekHeight, Math.round(vh * 0.35));
        case 'full':
          return Math.round(vh * 0.92);
        default:
          return peekHeight;
      }
    },
    [peekHeight, desktopBounds]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button (left click or touch)
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    isDraggingRef.current = true;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const clientY = e.clientY;
    currentYRef.current = clientY;
    const deltaY = clientY - startYRef.current;
    setDragOffset(deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingRef.current = false;
    setIsDragging(false);

    const deltaY = currentYRef.current - startYRef.current;
    const timeElapsed = Date.now() - startTimeRef.current;
    const velocity = deltaY / Math.max(timeElapsed, 1); // px per ms

    setDragOffset(0);

    // If it was a quick click/tap without dragging
    if (Math.abs(deltaY) < 6 && timeElapsed < 300) {
      updateSnapState(snapState === 'peek' ? 'full' : 'peek');
      return;
    }

    // Fast flick gesture detection
    if (velocity < -0.25) {
      // Swiped UP fast
      updateSnapState('full');
      return;
    } else if (velocity > 0.25) {
      // Swiped DOWN fast
      updateSnapState('peek');
      return;
    }

    // Distance-based snapping between peek and full
    const peekH = getHeightForState('peek');
    const fullH = getHeightForState('full');
    const currentBaseHeight = getHeightForState(snapState);
    const targetHeight = currentBaseHeight - deltaY;
    const midpoint = (peekH + fullH) / 2;

    if (targetHeight >= midpoint) {
      updateSnapState('full');
    } else {
      updateSnapState('peek');
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const baseHeight = getHeightForState(snapState);
  const minAllowedHeight = Math.max(120, getHeightForState('peek') - 50);
  const fullHeight = getHeightForState('full');
  const dynamicHeight = isDragging
    ? Math.min(fullHeight + 20, Math.max(minAllowedHeight, baseHeight - dragOffset))
    : baseHeight;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const desktopStyle = isDesktop && desktopBounds
    ? {
        left: `${desktopBounds.left}px`,
        width: `${desktopBounds.width}px`,
        right: 'auto',
        maxWidth: 'none',
        margin: '0',
      }
    : {};

  return (
    <div
      ref={sheetRef}
      data-bottom-sheet="true"
      style={{
        height: `${dynamicHeight}px`,
        transition: isDragging ? 'none' : 'height 300ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        ...desktopStyle,
      }}
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-surface border-t border-x border-secondary/30 rounded-t-2xl overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.18)] text-primary max-w-lg mx-auto ${className}`}
    >
      {/* Drag Handle Bar */}
      {showHandle && (
        <div
          className="w-full flex flex-col items-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="w-12 h-1.5 bg-secondary/40 hover:bg-secondary/70 rounded-full transition-colors" />
        </div>
      )}

      {/* Optional Sticky Header */}
      {headerContent && (
        <div
          className="flex-shrink-0 touch-none select-none px-4 pb-2"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {headerContent}
        </div>
      )}

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto select-text"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              dragHandleProps: {
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                onPointerUp: handlePointerUp,
                onPointerCancel: handlePointerCancel,
              },
            })
          : children}
      </div>
    </div>
  );
}
