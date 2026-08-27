export function parseVndInput(value: string): number | null {
  if (!value) return null;
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
  if (!normalized) return null;

  // Case 1: 2tr5, 2t5, 2triệu5, 2tr 5
  const splitMillionMatch = normalized.match(/^(\d+)\s*(?:tr|t|triệu|trieu)\s*(\d+)$/);
  if (splitMillionMatch) {
    const main = Number(splitMillionMatch[1]);
    const fracStr = splitMillionMatch[2];
    const frac = Number(fracStr) / Math.pow(10, fracStr.length);
    return Math.round((main + frac) * 1_000_000);
  }

  // Case 2: Explicit million suffix e.g. 2.5tr, 2,5tr, 3triệu, 2.5m, 2t
  const millionMatch = normalized.replace(',', '.').match(/^(\d+(?:\.\d+)?)\s*(?:tr|triệu|trieu|m|t)$/);
  if (millionMatch) {
    return Math.round(Number(millionMatch[1]) * 1_000_000);
  }

  // Case 3: Explicit thousand suffix e.g. 3500k, 500k
  const thousandMatch = normalized.replace(',', '.').match(/^(\d+(?:\.\d+)?)\s*(?:k)$/);
  if (thousandMatch) {
    return Math.round(Number(thousandMatch[1]) * 1_000);
  }

  // Case 4: Plain numbers (e.g., 2, 2.5, 2,5, 3500000, 3.500.000)
  // Handle dot-separated thousands like 3.500.000
  let cleanStr = normalized;
  if (/^\d{1,3}(\.\d{3})+$/.test(cleanStr)) {
    cleanStr = cleanStr.replace(/\./g, '');
  } else {
    cleanStr = cleanStr.replace(',', '.');
  }

  const digitsOnly = cleanStr.replace(/[^0-9.]/g, '');
  if (!digitsOnly) return null;

  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  // Numbers less than 100 (e.g. 2, 2.5, 15) are assumed to be in Millions VND
  if (parsed > 0 && parsed < 100) {
    return Math.round(parsed * 1_000_000);
  }

  return Math.round(parsed);
}

export function handleHoverMarqueeEnter(e: React.MouseEvent<HTMLElement>) {
  const target = e.currentTarget;
  const isInput = target.tagName === 'INPUT';
  const scrollEl = target;
  const contentEl = (target.firstElementChild as HTMLElement) || target;

  const scrollWidth = isInput ? (target as HTMLInputElement).scrollWidth : contentEl.scrollWidth;
  const clientWidth = target.clientWidth;

  if (scrollWidth > clientWidth) {
    const maxScroll = scrollWidth - clientWidth;
    target.dataset.hovering = 'true';
    let start: number | null = null;
    const duration = Math.max(1500, 1000 + maxScroll * 25);

    const animate = (timestamp: number) => {
      if (target.dataset.hovering !== 'true') return;
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const pct = Math.min(progress / duration, 1);
      scrollEl.scrollLeft = pct * maxScroll;
      if (pct < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
}

export function handleHoverMarqueeLeave(e: React.MouseEvent<HTMLElement>) {
  const target = e.currentTarget;
  target.dataset.hovering = 'false';
  target.scrollLeft = 0;
}

export function parseKeywords(query: string): string[] {
  if (!query || !query.trim()) return [];
  return query
    .split(/[,;]+/)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length >= 10) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned.replace(/\D/g, '');
}

export type SearchTokenType = 'phone' | 'address' | 'keyword' | 'empty';

export function classifySearchToken(query: string): SearchTokenType {
  if (!query || !query.trim()) return 'empty';
  const trimmed = query.trim().toLowerCase();
  const phoneClean = normalizePhone(trimmed);

  // Phone: 9-11 digits, starts with 0 or 84/+84
  if (phoneClean.length >= 9 && phoneClean.length <= 11 && phoneClean.startsWith('0')) {
    return 'phone';
  }

  // Address markers: alley, street, ward, house numbers
  const addressRegex = /\b(ngõ|ngách|hẻm|đường|phố|số|quận|phường|p\.|q\.|tổ|thôn|khu|toà|tòa)\b|\d+[\/a-z]/i;
  if (addressRegex.test(trimmed)) {
    return 'address';
  }

  return 'keyword';
}

export function matchesKeywords(
  keywords: string[],
  searchableText: (string | null | undefined)[]
): boolean {
  if (keywords.length === 0) return true;
  const combinedText = searchableText
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return keywords.every((kw) => combinedText.includes(kw));
}

export type ReviewSearchMode = 'phone' | 'address' | 'brand';

export function matchTargetPhone(query: string, review: any): boolean {
  if (!query || !query.trim()) return false;
  const queryDigits = normalizePhone(query);
  // Phone query MUST contain at least 4 digits to prevent arbitrary text from matching
  if (!queryDigits || queryDigits.length < 4) {
    return false;
  }

  const candidatePhones: (string | null | undefined)[] = [
    review.target_phone,
    review.contact_info,
    review.extracted_data?.landlord_phone,
    review.extracted_data?.contact_info,
  ];

  for (const cp of candidatePhones) {
    if (cp) {
      const normalizedCp = normalizePhone(cp);
      if (normalizedCp && (normalizedCp.includes(queryDigits) || queryDigits.includes(normalizedCp))) {
        return true;
      }
    }
  }

  // Check explicit phone patterns in review content (only valid phone number tokens)
  if (review.content) {
    const phoneMatches = (review.content as string).match(/(?:0|\+?84)?\s*(?:3|5|7|8|9)\d{8}\b|\b\d{9,11}\b/g);
    if (phoneMatches) {
      for (const rawMatch of phoneMatches) {
        const normMatch = normalizePhone(rawMatch);
        if (normMatch && (normMatch.includes(queryDigits) || queryDigits.includes(normMatch))) {
          return true;
        }
      }
    }
  }

  return false;
}

export function matchAddressIdentity(query: string, review: any): boolean {
  if (!query || !query.trim()) return false;
  const normalizedQuery = query.toLowerCase().trim().replace(/[,./\-]/g, ' ');
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  const addressCorpus = [
    review.buildings?.address_text,
    review.buildings?.street_text,
    review.buildings?.house_number,
    review.extracted_data?.address_raw,
    review.address_masked,
    review.houses?.address_text,
    review.content,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[,./\-]/g, ' ');

  if (!addressCorpus) return false;

  // Enforce multi-token AND matching on address corpus
  return tokens.every((token) => addressCorpus.includes(token));
}

export function matchTargetBrand(query: string, review: any): boolean {
  if (!query || !query.trim()) return false;
  const keywords = parseKeywords(query);
  if (keywords.length === 0) return false;

  const brandCorpus = [
    review.target_brand,
    review.extracted_data?.operator_name,
    review.extracted_data?.brand,
    review.extracted_data?.brand_name,
    review.extracted_data?.chain_name,
    review.extracted_data?.landlord_name,
  ];

  return matchesKeywords(keywords, brandCorpus);
}

export function matchesTargetedReviewSearch(
  query: string,
  mode: ReviewSearchMode,
  review: any
): boolean {
  if (!query || !query.trim()) return false;

  if (mode === 'phone') {
    return matchTargetPhone(query, review);
  }
  if (mode === 'address') {
    return matchAddressIdentity(query, review);
  }
  if (mode === 'brand') {
    return matchTargetBrand(query, review);
  }

  return false;
}
