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
  onClose?: () => void;
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
  onClose,
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
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);

  const triggerClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 280);
  }, [onClose]);

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
      setDragOffset(0);
      updateSnapState('full');
      return;
    } else if (velocity > 0.25) {
      // Swiped DOWN fast
      if (snapState === 'peek' && onClose) {
        triggerClose();
        return;
      }
      setDragOffset(0);
      updateSnapState('peek');
      return;
    }

    // Distance-based snapping between peek, full, or closing
    const peekH = getHeightForState('peek');
    const fullH = getHeightForState('full');
    const currentBaseHeight = getHeightForState(snapState);
    const targetHeight = currentBaseHeight - deltaY;

    // If starting from peek and dragged downwards
    if (snapState === 'peek' && (deltaY > 30 || targetHeight < peekH * 0.85)) {
      if (onClose) {
        triggerClose();
        return;
      }
    }

    setDragOffset(0);

    // If it was a quick click/tap without dragging
    if (Math.abs(deltaY) < 6 && timeElapsed < 300) {
      updateSnapState(snapState === 'peek' ? 'full' : 'peek');
      return;
    }

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

  const peekH = getHeightForState('peek');
  const fullH = getHeightForState('full');
  const baseHeight = getHeightForState(snapState);

  const translateY = isClosing
    ? 'translateY(100%)'
    : isDragging && snapState === 'peek' && dragOffset > 0
    ? `translateY(${dragOffset}px)`
    : 'translateY(0)';

  const dynamicHeight =
    isDragging && (snapState === 'full' || dragOffset < 0)
      ? Math.min(fullH + 20, Math.max(peekH, baseHeight - dragOffset))
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
        transform: translateY,
        transition: isDragging
          ? 'none'
          : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1), height 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        ...desktopStyle,
      }}
      className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-surface border-t border-x border-secondary/30 rounded-t-2xl overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.18)] text-primary max-w-lg mx-auto ${className}`}
    >
      {/* Drag Handle Bar */}
      {showHandle && (
        <div
          className="w-full flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="w-10 h-1 bg-secondary/40 hover:bg-secondary/70 rounded-full transition-colors" />
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

      {/* Content Container */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col min-h-0 overflow-hidden select-text"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
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
