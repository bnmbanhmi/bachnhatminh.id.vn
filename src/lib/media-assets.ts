export type MediaAssetType = 'image' | 'video';

export interface MediaAsset {
  source_index?: number;
  url: string;
  object_key?: string;
  media_type: MediaAssetType;
  mime_type?: string;
  sha256?: string;
  status?: 'ready' | 'failed' | string;
  error_code?: string;
}

function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.url === 'string' && candidate.url.length > 0;
}

export function isVideoMediaAsset(asset: MediaAsset): boolean {
  return (
    asset.media_type === 'video' ||
    Boolean(asset.mime_type?.startsWith('video/')) ||
    /\.(?:mp4|webm|mov|m4v)(?:$|[?#])/i.test(asset.url)
  );
}

export function normalizeMediaAssets(
  media?: string[] | null,
  manifest?: unknown
): MediaAsset[] {
  const structured = Array.isArray(manifest)
    ? manifest.filter(isMediaAsset).filter((asset) => asset.status !== 'failed')
    : [];

  if (structured.length > 0) {
    return Array.from(new Map(structured.map((asset) => [asset.url, {
      ...asset,
      media_type: isVideoMediaAsset(asset) ? ('video' as const) : ('image' as const),
    }])).values());
  }

  return Array.from(new Set((media || []).filter(Boolean))).map((url) => ({
    url,
    media_type: isVideoMediaAsset({ url, media_type: 'image' }) ? 'video' : 'image',
    status: 'ready' as const,
  }));
}

export function visibleMediaAssets(
  media?: string[] | null,
  manifest?: unknown,
  sourceType?: string | null,
  limitUnverifiedScraped = true
): MediaAsset[] {
  const assets = normalizeMediaAssets(media, manifest);
  const normalizedSource = (sourceType || '').toLowerCase();
  const isScraped = normalizedSource.includes('threads') || normalizedSource.includes('facebook');

  if (!limitUnverifiedScraped || !isScraped) return assets;

  const representative = assets.find((asset) => asset.media_type === 'image') || assets[0];
  return representative ? [representative] : [];
}
