'use client';

import React, { useState } from 'react';
import { trackContactIntent, trackOutboundClick, trackSocialAction } from '@/lib/telemetry';
import { SourceAndContactInfo } from '@/components/ReviewCard';

export interface ContactDisclosureProps {
  info: SourceAndContactInfo;
  buildingId?: string | null;
  postId?: string | null;
  sourceType?: string | null;
  onRequireAuth?: () => void;
  onConvertedOutbound?: () => void;
  className?: string;
  size?: 'sm' | 'base';
}

export default function ContactDisclosure({
  info,
  buildingId,
  postId,
  sourceType,
  onRequireAuth,
  onConvertedOutbound,
  className = '',
  size = 'base',
}: ContactDisclosureProps) {
  const [copied, setCopied] = useState(false);
  const isSmall = size === 'sm';

  // 1. External Source with URL -> Clear, high-contrast CTA Button
  if (info.sourceUrl) {
    return (
      <a
        href={info.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          onConvertedOutbound?.();
          if (postId) {
            trackOutboundClick(postId, sourceType || 'external');
          }
          const urlLower = (info.sourceUrl || '').toLowerCase();
          const typeLower = (sourceType || '').toLowerCase();
          const isZalo = urlLower.includes('zalo.me') || typeLower.includes('zalo');
          const isFb = urlLower.includes('facebook.com') || urlLower.includes('fb.com') || typeLower.includes('facebook');
          const targetId = postId || buildingId || undefined;

          if (isZalo) {
            trackSocialAction({
              action_type: 'share_zalo',
              target_type: postId ? 'post' : 'building',
              target_id: targetId,
            });
          } else if (isFb) {
            trackSocialAction({
              action_type: 'share_facebook',
              target_type: postId ? 'post' : 'building',
              target_id: targetId,
            });
          }
        }}
        className={`${
          isSmall
            ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-neutral text-xs font-semibold px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1'
            : 'bg-tertiary text-neutral font-semibold text-sm sm:text-base px-4 py-2 rounded-md hover:bg-[#A23522] transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]'
        } ${className}`}
      >
        <span>{info.sourceText}</span>
        <svg
          className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 stroke-current`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a>
    );
  }

  // 2. Unauthenticated -> Inviting Auth Trigger CTA Button
  if (info.isAuthRequired) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (buildingId || postId) {
            trackContactIntent(buildingId || undefined, postId || undefined, 'auth_prompt');
          }
          onRequireAuth?.();
        }}
        className={`cursor-pointer ${
          isSmall
            ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-neutral text-xs font-semibold px-2.5 py-1 rounded transition-colors inline-flex items-center justify-center gap-1'
            : 'bg-tertiary text-neutral font-semibold text-sm sm:text-base px-4 py-2 rounded-md hover:bg-[#A23522] transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]'
        } ${className}`}
      >
        <span>{info.sourceText || 'Đăng nhập để liên hệ'}</span>
        <svg
          className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 stroke-current`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </button>
    );
  }

  // 3. Authenticated with Contact -> Clean, accessible button with copy status
  if (info.contactText) {
    const cleanPhone = info.contactText.replace(/\D/g, '');
    const textToCopy = cleanPhone || info.contactText;

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onConvertedOutbound?.();
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(textToCopy);
        trackContactIntent(buildingId || undefined, postId || undefined, 'copy_contact');
        trackSocialAction({
          action_type: 'copy_phone',
          target_type: postId ? 'post' : 'building',
          target_id: postId || buildingId || undefined,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Đã sao chép vào bộ nhớ tạm!' : `Sao chép liên hệ: ${info.contactText}`}
        aria-label={copied ? 'Đã sao chép liên hệ' : `Sao chép liên hệ ${info.contactText}`}
        className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
          isSmall
            ? 'bg-neutral text-primary hover:bg-neutral/80 border border-secondary/30 text-xs px-2.5 py-1 rounded'
            : 'bg-neutral text-primary hover:bg-neutral/80 border border-secondary/30 text-sm sm:text-base px-4 py-2 rounded-md shadow-xs active:scale-[0.98]'
        } ${className}`}
      >
        <span>{info.sourceText || `Liên hệ: ${info.contactText}`}</span>
        {copied ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
            <svg
              className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Đã chép</span>
          </span>
        ) : (
          <svg
            className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-secondary shrink-0`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    );
  }

  // 4. Other source text (e.g. named source without URL like "Nguồn: Tổng hợp")
  if (info.sourceText) {
    return (
      <span
        className={`text-secondary font-medium inline-flex items-center ${
          isSmall ? 'text-xs' : 'text-xs sm:text-sm'
        } ${className}`}
      >
        {info.sourceText}
      </span>
    );
  }

  return null;
}
