'use client';

import { useEffect } from 'react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  maxWidth = 'max-w-md',
  children,
  showCloseButton = true,
}: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`bg-surface border border-secondary/60 w-full ${maxWidth} rounded-lg p-6 shadow-xl flex flex-col relative text-left`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center border-b border-secondary/40 pb-3 mb-4">
            {title ? (
              <h3 className="text-lg font-bold text-primary font-sans">{title}</h3>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="text-secondary hover:text-primary text-xl font-bold w-8 h-8 rounded-md hover:bg-neutral flex items-center justify-center transition-colors cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
