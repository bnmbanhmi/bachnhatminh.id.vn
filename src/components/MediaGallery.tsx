'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MediaAssetView from '@/components/MediaAssetView';
import { normalizeMediaAssets, isVideoMediaAsset, type MediaAsset } from '@/lib/media-assets';

interface MediaGalleryProps {
  images?: string[] | null;
  assets?: MediaAsset[] | null;
  alt: string;
  variant?: 'hero' | 'feed';
  emptyLabel?: string;
  className?: string;
}

export default function MediaGallery({
  images,
  assets,
  alt,
  variant = 'feed',
  emptyLabel,
  className = '',
}: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const uniqueAssets = useMemo(() => {
    const sourceAssets = assets && assets.length > 0 ? assets : normalizeMediaAssets(images);
    return Array.from(new Map(sourceAssets.filter((asset) => asset.url).map((asset) => [asset.url, asset])).values());
  }, [assets, images]);

  const imageIndexes = useMemo(
    () => uniqueAssets.reduce<number[]>((indexes, asset, index) => {
      if (!isVideoMediaAsset(asset)) indexes.push(index);
      return indexes;
    }, []),
    [uniqueAssets]
  );

  const moveToImage = useCallback((current: number, direction: -1 | 1) => {
    if (imageIndexes.length < 2) return current;
    const currentImagePosition = Math.max(0, imageIndexes.indexOf(current));
    const nextPosition = (currentImagePosition + direction + imageIndexes.length) % imageIndexes.length;
    return imageIndexes[nextPosition];
  }, [imageIndexes]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (imageIndexes.length > 1 && event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current === null ? null : moveToImage(current, -1)
        );
      }
      if (imageIndexes.length > 1 && event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current === null ? null : moveToImage(current, 1)
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, imageIndexes.length, moveToImage]);

  if (uniqueAssets.length === 0) {
    if (!emptyLabel) return null;
    return (
      <div className={`mx-4 flex h-52 items-center justify-center bg-neutral text-sm text-secondary sm:h-64 ${className}`}>
        {emptyLabel}
      </div>
    );
  }

  const isHero = variant === 'hero';
  const frameClass = isHero
    ? 'h-64 w-[82vw] max-w-[620px] sm:h-80 sm:w-[68vw] md:h-96 md:w-[58%]'
    : 'h-48 w-[78vw] max-w-[440px] sm:h-60 sm:w-[52vw] md:w-[42%]';

  return (
    <>
      <div
        className={`flex w-full snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
        aria-label={`Thư viện media ${alt}`}
      >
        {uniqueAssets.map((asset, index) => {
          const label = `${alt} - ${isVideoMediaAsset(asset) ? 'video' : 'ảnh'} ${index + 1}`;
          if (isVideoMediaAsset(asset)) {
            return (
              <div key={`${asset.url}-${index}`} className={`relative shrink-0 snap-start overflow-hidden rounded-md bg-neutral ${frameClass}`}>
                <MediaAssetView asset={asset} alt={label} className="h-full w-full object-cover" />
              </div>
            );
          }

          return (
            <button
              key={`${asset.url}-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`group relative shrink-0 snap-start cursor-zoom-in overflow-hidden rounded-md bg-neutral focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary ${frameClass}`}
              aria-label={`Mở ảnh ${index + 1} trong ${uniqueAssets.length}`}
            >
              <MediaAssetView asset={asset} alt={label} controls={false} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
            </button>
          );
        })}
      </div>

      {activeIndex !== null && uniqueAssets[activeIndex] && !isVideoMediaAsset(uniqueAssets[activeIndex]) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh ${alt}`}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Đóng xem ảnh"
          >
            X
          </button>

          {imageIndexes.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(moveToImage(activeIndex, -1));
                }}
                className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
                aria-label="Ảnh trước"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(moveToImage(activeIndex, 1));
                }}
                className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
                aria-label="Ảnh tiếp theo"
              >
                Sau
              </button>
            </>
          )}

          <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
            <MediaAssetView
              asset={uniqueAssets[activeIndex]}
              alt={`${alt} - ảnh ${activeIndex + 1}`}
              controls={false}
              className="max-h-[84vh] max-w-[92vw] object-contain"
            />
            <span className="text-xs font-semibold text-white">
              {activeIndex + 1}/{uniqueAssets.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
