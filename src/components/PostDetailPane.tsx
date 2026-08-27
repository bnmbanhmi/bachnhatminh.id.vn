'use client';

import React from 'react';
import { PORTFOLIO_LISTINGS, type ArticleContent, type ArticleSection } from '@/lib/portfolio-data';
import type { Listing } from '@/components/ListingCard';

export interface PostDetailPaneProps {
  elasticId?: string;
  postId?: string;
  profileId?: string;
  onClose?: () => void;
  onRequestWriteReview?: (buildingId: string) => void;
  onRequireAuth?: () => void;
  isMobile?: boolean;
  className?: string;
  initialTab?: 'all' | 'listings' | 'reviews' | 'roommates';
  highlightReviewId?: string;
  highlightPostId?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function PostDetailPane({
  elasticId,
  postId,
  onClose,
  className = '',
}: PostDetailPaneProps) {
  const targetId = (postId || elasticId || '').toLowerCase().trim();

  const item: Listing | undefined = PORTFOLIO_LISTINGS.find(
    (p) =>
      p.id.toLowerCase() === targetId ||
      p.short_id?.toLowerCase() === targetId ||
      p.title.toLowerCase() === targetId
  ) || PORTFOLIO_LISTINGS[0];

  if (!item) {
    return (
      <div className={`p-8 text-center text-xs text-secondary ${className}`}>
        No details found.
      </div>
    );
  }

  const article: ArticleContent | null | undefined = item.article;
  const sourceUrl = item.source_url;
  const linkText = item.link_text || (sourceUrl ? sourceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null);
  const subtitle =
    (typeof item.extracted_data?.subtitle === 'string' ? item.extracted_data.subtitle : null) ||
    item.buildings?.street_text ||
    null;
  const dateSpec =
    item.date_range ||
    (typeof item.extracted_data?.date_range === 'string' ? item.extracted_data.date_range : null) ||
    item.published_at ||
    item.created_at ||
    null;

  return (
    <div className={`flex flex-col bg-surface text-primary ${className}`}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-surface border-b border-secondary/20 shadow-xs w-full">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight leading-snug flex-1 min-w-0 truncate">
            {item.title}
          </h1>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-md text-secondary hover:text-primary hover:bg-neutral transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Article Content Container */}
      <article className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Outbound Link & Metadata Row */}
        {(sourceUrl || subtitle || dateSpec) && (
          <div className="flex flex-col gap-2 pb-3 border-b border-secondary/15">
            {sourceUrl && (
              <div className="w-full flex items-center justify-between gap-2">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-tertiary font-semibold text-xs sm:text-sm underline underline-offset-4 decoration-secondary/40 hover:decoration-tertiary inline-flex items-center gap-1.5 transition-colors break-words"
                >
                  <span>{linkText}</span>
                  <svg className="w-3.5 h-3.5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            {(subtitle || dateSpec) && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-sans">
                {subtitle && <span className="text-secondary font-medium">{subtitle}</span>}
                {dateSpec && <span className="text-tertiary font-bold font-space-grotesk ml-auto">{dateSpec}</span>}
              </div>
            )}
          </div>
        )}

        {/* Structured Article or Flat Content */}
        {article ? (
          <div className="flex flex-col gap-6 text-sm text-primary leading-relaxed">
            {article.tagline && (
              <p className="text-sm sm:text-base font-medium text-primary/90 leading-relaxed italic border-l-2 border-tertiary pl-3 py-0.5">
                {article.tagline}
              </p>
            )}

            {article.sections && article.sections.map((sec: ArticleSection, sIdx: number) => (
              <section key={sIdx} className="flex flex-col gap-2.5">
                {sec.sectionTitle && (
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary font-space-grotesk">
                    {sec.sectionTitle}
                  </h2>
                )}

                {sec.callout && (
                  <p className="text-xs sm:text-sm font-medium text-primary bg-neutral/80 p-2.5 rounded-md border border-secondary/20">
                    {sec.callout}
                  </p>
                )}

                {sec.paragraphs && sec.paragraphs.map((p: string, pIdx: number) => (
                  <p key={pIdx} className="text-xs sm:text-sm text-primary/90 leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.listItems && sec.listItems.length > 0 && (
                  <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-primary/90 pl-1">
                    {sec.listItems.map((itemStr: string, lIdx: number) => (
                      <li key={lIdx} className="leading-relaxed">
                        <span>{itemStr}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Metrics */}
                {sec.metrics && sec.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {sec.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex flex-col p-2.5 rounded-md bg-neutral border border-secondary/20">
                        <span className="text-[11px] text-secondary font-medium">{m.label}</span>
                        <span className="text-base sm:lg font-bold text-tertiary font-space-grotesk">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources / References */}
                {sec.sources && sec.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sec.sources.map((src, srcIdx) => (
                      <a
                        key={srcIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-secondary hover:text-tertiary bg-neutral hover:bg-neutral/80 px-2 py-1 rounded border border-secondary/20 transition-colors inline-flex items-center gap-1"
                      >
                        <span>{src.title || src.author || src.url}</span>
                        <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-primary/90 leading-relaxed whitespace-pre-line">
            {item.content || item.description || 'No detailed content available.'}
          </div>
        )}
      </article>
    </div>
  );
}
