'use client';

export type HomeSearchTab = 'listing' | 'review' | 'roommate';
export type HistoryWriteMode = 'push' | 'replace';

export interface NormalizedHomeSearchParams {
  params: URLSearchParams;
  tab: HomeSearchTab;
  changed: boolean;
}

const LISTING_TAB_ALIASES = new Set([
  'listing',
  'listings',
  'building',
  'buildings',
  'units',
  'house',
  'houses',
]);

const REVIEW_TAB_ALIASES = new Set([
  'review',
  'reviews',
]);

const ROOMMATE_TAB_ALIASES = new Set([
  'roommate',
  'roommates',
]);

function copyParams(input: URLSearchParams | string): URLSearchParams {
  return new URLSearchParams(
    typeof input === 'string' ? input : input.toString()
  );
}

export function normalizeHomeSearchParams(
  input: URLSearchParams | string
): NormalizedHomeSearchParams {
  const original = copyParams(input);
  const params = copyParams(input);
  const requestedTab = params.get('tab');

  // Normalize legacy post/review parameters to canonical 'post'
  if (params.has('highlightPostId')) {
    const legacyId = params.get('highlightPostId');
    if (legacyId && !params.has('post')) {
      params.set('post', legacyId);
    }
    params.delete('highlightPostId');
  }
  if (params.has('review')) {
    const reviewId = params.get('review');
    if (reviewId && !params.has('post')) {
      params.set('post', reviewId);
    }
    params.delete('review');
  }

  if (params.get('type') === 'listings') {
    params.delete('type');
    params.set('tab', 'listing');
    params.set('subtab', 'pass');
    return {
      params,
      tab: 'listing',
      changed: params.toString() !== original.toString(),
    };
  }

  let tab: HomeSearchTab;
  if (requestedTab && REVIEW_TAB_ALIASES.has(requestedTab)) {
    tab = 'review';
    if (requestedTab !== 'review') {
      params.set('tab', 'review');
    }
  } else if (requestedTab && LISTING_TAB_ALIASES.has(requestedTab)) {
    tab = 'listing';
    if (requestedTab !== 'listing') {
      params.set('tab', 'listing');
    }
  } else if (requestedTab && ROOMMATE_TAB_ALIASES.has(requestedTab)) {
    tab = 'roommate';
    if (requestedTab !== 'roommate') {
      params.set('tab', 'roommate');
    }
  } else if (requestedTab) {
    tab = 'review';
    params.set('tab', 'review');
  } else {
    tab = 'review';
  }

  const subtab = params.get('subtab');
  if (tab === 'listing') {
    if (subtab === 'request') {
      params.set('subtab', 'search');
    } else if (subtab && !['post', 'search', 'pass'].includes(subtab)) {
      params.delete('subtab');
    }
  } else if (tab === 'roommate') {
    params.delete('type');
    if (subtab !== 'post') {
      params.delete('subtab');
    }
  } else {
    // tab === 'review'
    params.delete('type');
    if (subtab === 'write') {
      params.set('subtab', 'post');
    } else if (subtab && !['post', 'search'].includes(subtab)) {
      params.delete('subtab');
    }
  }

  return {
    params,
    tab,
    changed: params.toString() !== original.toString(),
  };
}

export function writeHomeSearchParams(
  input: URLSearchParams | string,
  mode: HistoryWriteMode = 'push'
) {
  if (typeof window === 'undefined') return;

  const params = copyParams(input);
  const query = params.toString();
  const url = `/${query ? `?${query}` : ''}${window.location.hash}`;

  if (mode === 'replace') {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
}

export function pushHomeSearchParams(input: URLSearchParams | string) {
  writeHomeSearchParams(input, 'push');
}

export function replaceHomeSearchParams(input: URLSearchParams | string) {
  writeHomeSearchParams(input, 'replace');
}
