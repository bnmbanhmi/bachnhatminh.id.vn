/**
 * Utilities for post slug generation, short ID extraction, and Hybrid Slug URL construction.
 * Pattern: nhaminhbach.com/p/{slug}--{short_id}
 */

/**
 * Normalizes Vietnamese text to a clean ASCII URL slug (lowercase, hyphen-separated).
 */
export function generatePostSlug(
  content?: string | null,
  address?: string | null,
  fallbackType: string = 'post'
): string {
  const sourceText = (content && content.trim().length > 0)
    ? content.trim()
    : (address && address.trim().length > 0 ? address.trim() : '');

  if (!sourceText) {
    return sanitizeSlug(fallbackType) || 'bai-dang';
  }

  // Take first 6 words
  const firstWords = sourceText.split(/\s+/).slice(0, 6).join(' ');

  const slug = sanitizeSlug(firstWords);
  return slug.length > 0 ? slug.slice(0, 45).replace(/-+$/, '') : (sanitizeSlug(fallbackType) || 'bai-dang');
}

/**
 * Strips Vietnamese diacritics and non-alphanumeric characters.
 */
function sanitizeSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts the 6-8 character short ID or raw UUID from a slug/ID parameter.
 * Examples:
 * - "chu-tro-ham-vai--x9k2mp" -> "x9k2mp"
 * - "pass-phong-cau-giay-x9k2mp" -> "x9k2mp"
 * - "x9k2mp" -> "x9k2mp"
 * - "b0f93041-1006-4b10-82d2-8b4317f223f0" -> "b0f93041-1006-4b10-82d2-8b4317f223f0"
 */
export function extractShortIdFromSlug(slugOrId: string): string {
  if (!slugOrId) return '';
  const trimmed = slugOrId.trim();

  // 1. UUID check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return trimmed;
  }

  // 2. Double-hyphen delimiter pattern: slug--shortId
  const doubleHyphenMatch = trimmed.match(/--([a-zA-Z0-9_-]+)$/);
  if (doubleHyphenMatch && doubleHyphenMatch[1]) {
    return doubleHyphenMatch[1];
  }

  // 3. Single-hyphen trailing short ID pattern (4 to 10 alphanumeric chars at the end)
  const singleHyphenMatch = trimmed.match(/-([a-zA-Z0-9]{4,10})$/);
  if (singleHyphenMatch && singleHyphenMatch[1]) {
    return singleHyphenMatch[1];
  }

  // 4. Raw short ID directly
  return trimmed;
}

/**
 * Builds the canonical hybrid slug identifier: {slug}--{shortId}
 */
export function buildPostHybridSlug(
  shortId: string,
  content?: string | null,
  address?: string | null,
  fallbackType: string = 'post'
): string {
  if (!shortId) return '';
  const slug = generatePostSlug(content, address, fallbackType);
  return `${slug}--${shortId}`;
}

/**
 * Builds full shareable post URL.
 */
export function buildPostShareUrl(
  shortId: string,
  content?: string | null,
  address?: string | null,
  fallbackType: string = 'post',
  baseUrl?: string
): string {
  const origin =
    baseUrl ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://nhaminhbach.com');
  if (!shortId) return origin;
  const hybridSlug = buildPostHybridSlug(shortId, content, address, fallbackType);
  return `${origin}/p/${hybridSlug}`;
}
