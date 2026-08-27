'use client';

import { isVideoMediaAsset, type MediaAsset } from '@/lib/media-assets';
import type { MouseEvent } from 'react';

interface MediaAssetViewProps {
  asset: MediaAsset;
  alt: string;
  className?: string;
  controls?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export default function MediaAssetView({
  asset,
  alt,
  className = '',
  controls = true,
  onClick,
}: MediaAssetViewProps) {
  if (isVideoMediaAsset(asset)) {
    return (
      <video
        src={asset.url}
        aria-label={alt}
        className={className}
        controls={controls}
        playsInline
        preload="metadata"
        onClick={onClick}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.url} alt={alt} className={className} onClick={onClick} />
  );
}
