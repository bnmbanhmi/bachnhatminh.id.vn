'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
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
  const specs: string[] =
    (Array.isArray(item.specs) && item.specs.length > 0 ? item.specs : null) ||
    (Array.isArray(item.extracted_data?.specs) && (item.extracted_data.specs as string[]).length > 0
      ? (item.extracted_data.specs as string[])
      : null) ||
    (typeof item.extracted_data?.subtitle === 'string'
      ? [item.extracted_data.subtitle]
      : item.buildings?.street_text
      ? [item.buildings.street_text]
      : []);

  const dateSpec =
    item.date_range ||
    (typeof item.extracted_data?.date_range === 'string' ? item.extracted_data.date_range : null) ||
    item.published_at ||
    item.created_at ||
    null;

  const markdownContent = item.content || item.description;

  return (
    <div className={`relative flex flex-col h-full overflow-hidden bg-surface text-primary ${className}`}>
      {/* Scrollable Article Content Container */}
      <article className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-6">
        {/* Editorial Article Header (Title + Cohesive Byline) */}
        <header className="flex flex-col gap-2 pb-4 border-b border-secondary/15">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tracking-tight leading-tight">
            {item.title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary font-medium flex-wrap">
            {specs.map((sp, sIdx) => (
              <React.Fragment key={sIdx}>
                {sIdx > 0 && <span className="text-secondary/40">•</span>}
                <span className="text-primary font-semibold">{sp}</span>
              </React.Fragment>
            ))}
            {dateSpec && (
              <>
                {specs.length > 0 && <span className="text-secondary/40">•</span>}
                <span className="text-tertiary font-bold font-space-grotesk">{dateSpec}</span>
              </>
            )}
            {sourceUrl && (
              <>
                <span className="text-secondary/40">•</span>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-tertiary font-semibold underline underline-offset-4 decoration-secondary/40 hover:decoration-tertiary inline-flex items-center gap-1 transition-colors"
                >
                  <span>{linkText}</span>
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </>
            )}
          </div>
        </header>

        {/* Structured Article or Markdown Content */}
        {article ? (
          <div className="flex flex-col gap-6 text-sm text-primary leading-relaxed">
            {article.sections && article.sections.map((sec: ArticleSection, sIdx: number) => (
              <section key={sIdx} className="flex flex-col gap-2.5">
                {sec.sectionTitle && (
                  <h2 className="text-sm sm:text-base font-bold text-primary tracking-tight font-sans">
                    {sec.sectionTitle}
                  </h2>
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
        ) : markdownContent ? (
          <div className="flex flex-col gap-4 text-xs sm:text-sm text-primary/90 leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base sm:text-lg font-bold text-primary tracking-tight mt-4 mb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm sm:text-base font-bold text-primary tracking-tight mt-4 mb-1">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs sm:text-sm font-bold text-primary tracking-tight mt-3 mb-1">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-xs sm:text-sm text-primary/90 leading-relaxed my-1">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-primary/90 pl-1 my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-primary/90 pl-1 my-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-tertiary pl-3 italic my-2 text-secondary">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-neutral px-1.5 py-0.5 rounded text-tertiary font-mono text-[11px] sm:text-xs">
                    {children}
                  </code>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tertiary hover:underline font-medium"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-primary/90 leading-relaxed whitespace-pre-line">
            No detailed content available.
          </div>
        )}
      </article>
    </div>
  );
}
