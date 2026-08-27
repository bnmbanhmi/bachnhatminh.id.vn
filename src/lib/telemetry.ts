import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest';

// Initialize PostHog client-side if key provided and not already initialized
if (typeof window !== 'undefined' && POSTHOG_KEY && !(posthog as unknown as { __loaded?: boolean }).__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
    },
    autocapture: true,
  });
}

const VISITOR_STORAGE_KEY = 'nmb_vid';
const VISITOR_EXPIRY_KEY = 'nmb_vid_exp';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * Returns true if current environment is localhost or explicitly flagged as an internal tester.
 */
export function isInternalTester(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    return localStorage.getItem('nmb_is_internal') === 'true';
  } catch {
    return false;
  }
}

/**
 * Returns a persistent 14-day random visitor ID stored in localStorage.
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return 'server-render';
  }

  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    const expiry = localStorage.getItem(VISITOR_EXPIRY_KEY);
    const now = Date.now();

    if (existing && expiry && parseInt(expiry, 10) > now) {
      return existing;
    }

    // Generate new random UUID
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `v_${Math.random().toString(36).slice(2, 11)}_${now}`;

    localStorage.setItem(VISITOR_STORAGE_KEY, newId);
    localStorage.setItem(VISITOR_EXPIRY_KEY, String(now + FOURTEEN_DAYS_MS));
    return newId;
  } catch {
    return 'temp-visitor';
  }
}

export interface UserEventPayload {
  event_name: string;
  tab?: string;
  building_id?: string;
  post_id?: string;
  metadata?: Record<string, unknown>;
  user_id?: string;
}

/**
 * Logs milestone user event both to PostHog and to Supabase user_events table.
 */
export function logUserEvent(payload: UserEventPayload): void {
  if (typeof window === 'undefined') return;

  const visitorId = getVisitorId();
  const internal = isInternalTester();

  // 1. PostHog tracking
  try {
    posthog.capture(payload.event_name, {
      tab: payload.tab,
      building_id: payload.building_id,
      post_id: payload.post_id,
      visitor_id: visitorId,
      ...(internal ? { is_internal: true, $internal_or_test_user: true } : {}),
      ...payload.metadata,
    });
  } catch {
    // PostHog error suppressed
  }

  // 2. Supabase user_events tracking via fast fetch
  try {
    const body = JSON.stringify({
      visitor_id: visitorId,
      event_name: payload.event_name,
      tab: payload.tab,
      building_id: payload.building_id,
      post_id: payload.post_id,
      metadata: {
        ...(payload.metadata || {}),
        ...(internal ? { is_internal: true } : {}),
      },
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry/event', blob);
    } else {
      fetch('/api/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently catch fetch errors to avoid blocking UI
      });
    }
  } catch {
    // Telemetry fail-safe
  }
}

// In-memory cache for search event deduplication (15-minute window)
let lastSearchSignature = '';
let lastSearchTimestamp = 0;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface SearchEventParams {
  tab: string;
  ward_codes?: string[];
  budget_min?: number | null;
  budget_max?: number | null;
  source_filter?: string;
  result_count: number;
  utm_source?: string;
  utm_campaign?: string;
  extra?: Record<string, unknown>;
}

/**
 * Debounces (1.5s) and deduplicates (15min window) search events.
 */
export function trackSearch(params: SearchEventParams): void {
  if (typeof window === 'undefined') return;

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    const sortedWards = (params.ward_codes || []).slice().sort().join(',');
    const signature = `${params.tab}|${sortedWards}|${params.budget_min ?? ''}|${params.budget_max ?? ''}|${params.source_filter ?? ''}`;
    const now = Date.now();

    // Deduplicate if identical search executed within 15 minutes
    if (signature === lastSearchSignature && now - lastSearchTimestamp < FIFTEEN_MINUTES_MS) {
      return;
    }

    lastSearchSignature = signature;
    lastSearchTimestamp = now;

    logUserEvent({
      event_name: 'search_executed',
      tab: params.tab,
      metadata: {
        ward_codes: params.ward_codes || [],
        budget_min: params.budget_min ?? null,
        budget_max: params.budget_max ?? null,
        source_filter: params.source_filter || 'all',
        result_count: params.result_count,
        utm_source: params.utm_source || null,
        utm_campaign: params.utm_campaign || null,
        ...(params.extra || {}),
      },
    });
  }, 1500);
}

/**
 * Tracks when a user opens a building card, popup, or bottom sheet.
 */
export function trackBuildingInspect(
  buildingId: string,
  postType?: string,
  tab?: string,
  metadata?: Record<string, unknown>
): void {
  logUserEvent({
    event_name: 'building_inspected',
    tab,
    building_id: buildingId,
    metadata: {
      post_type: postType || null,
      ...metadata,
    },
  });
}

/**
 * Tracks user intent to contact landlord or post author.
 */
export function trackContactIntent(
  buildingId?: string,
  postId?: string,
  contactType?: 'phone_reveal' | 'zalo_redirect' | 'auth_prompt' | 'copy_contact',
  metadata?: Record<string, unknown>
): void {
  logUserEvent({
    event_name: 'contact_intent',
    building_id: buildingId,
    post_id: postId,
    metadata: {
      contact_type: contactType || 'phone_reveal',
      ...metadata,
    },
  });
}

/**
 * Tracks form progression and drop-offs.
 */
export function trackFormStep(
  formType: 'review_submission' | 'listing_post' | 'roommate_post' | 'search_demand' | 'dispute_claim',
  step: 'started' | 'step_completed' | 'submitted' | 'abandoned',
  metadata?: Record<string, unknown>
): void {
  logUserEvent({
    event_name: 'form_funnel',
    metadata: {
      form_type: formType,
      step,
      ...metadata,
    },
  });
}

/**
 * Tracks outbound clicks to original source platforms.
 */
export function trackOutboundClick(
  postId?: string,
  sourcePlatform?: string,
  metadata?: Record<string, unknown>
): void {
  logUserEvent({
    event_name: 'outbound_click',
    post_id: postId,
    metadata: {
      source_platform: sourcePlatform || 'unknown',
      ...metadata,
    },
  });
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  logUserEvent({
    event_name: name,
    metadata: properties,
  });
}

export interface FilterAppliedEventParams {
  tab: string;
  filter_name: string;
  filter_value: unknown;
  previous_result_count?: number;
  new_result_count: number;
  is_zero_result: boolean;
  extra?: Record<string, unknown>;
}

/**
 * Tracks when a user applies or modifies a search or feed filter.
 */
export function trackFilterApplied(params: {
  tab: string;
  filter_name: string;
  filter_value: unknown;
  previous_result_count?: number;
  new_result_count: number;
  is_zero_result: boolean;
  extra?: Record<string, unknown>;
}): void {
  logUserEvent({
    event_name: 'filter_applied',
    tab: params.tab,
    metadata: {
      filter_name: params.filter_name,
      filter_value: params.filter_value,
      previous_result_count: params.previous_result_count ?? null,
      new_result_count: params.new_result_count,
      is_zero_result: params.is_zero_result,
      ...(params.extra || {}),
    },
  });
}

export type MapInteractionType = 'pin_tap' | 'cluster_tap' | 'pan_drag' | 'zoom_change' | 'locate_me_gps';

export interface MapInteractionParams {
  tab?: string;
  interaction_type: MapInteractionType;
  target_id?: string;
  zoom_level?: number;
  extra?: Record<string, unknown>;
}

/**
 * Tracks map interactions. High-frequency interactions ('pan_drag', 'zoom_change')
 * are sent ONLY to PostHog to prevent Supabase database bloat, while milestone interactions
 * ('pin_tap', 'cluster_tap', 'locate_me_gps') are logged to both PostHog and Supabase.
 */
export function trackMapInteraction(params: {
  tab?: string;
  interaction_type: 'pin_tap' | 'cluster_tap' | 'pan_drag' | 'zoom_change' | 'locate_me_gps';
  target_id?: string;
  zoom_level?: number;
  extra?: Record<string, unknown>;
}): void {
  if (typeof window === 'undefined') return;

  const isHighFrequency = params.interaction_type === 'pan_drag' || params.interaction_type === 'zoom_change';

  if (isHighFrequency) {
    try {
      const visitorId = getVisitorId();
      const internal = isInternalTester();
      posthog.capture('map_interaction', {
        tab: params.tab,
        interaction_type: params.interaction_type,
        target_id: params.target_id,
        zoom_level: params.zoom_level,
        visitor_id: visitorId,
        ...(internal ? { is_internal: true } : {}),
        ...(params.extra || {}),
      });
    } catch {
      // PostHog error suppressed
    }
    return;
  }

  logUserEvent({
    event_name: 'map_interaction',
    tab: params.tab,
    building_id: params.interaction_type === 'pin_tap' ? params.target_id : undefined,
    metadata: {
      interaction_type: params.interaction_type,
      target_id: params.target_id,
      zoom_level: params.zoom_level,
      ...(params.extra || {}),
    },
  });
}

export type ViewModeType = 'map_view' | 'list_view' | 'split_view';

export interface ViewModeToggledParams {
  tab: string;
  mode: ViewModeType;
  sheet_state?: string;
  extra?: Record<string, unknown>;
}

/**
 * Tracks toggling between map, list, and split views.
 */
export function trackViewModeToggled(params: {
  tab: string;
  mode: 'map_view' | 'list_view' | 'split_view';
  sheet_state?: string;
  extra?: Record<string, unknown>;
}): void {
  logUserEvent({
    event_name: 'view_mode_toggled',
    tab: params.tab,
    metadata: {
      mode: params.mode,
      sheet_state: params.sheet_state || null,
      ...(params.extra || {}),
    },
  });
}

export interface CardDwellTimeParams {
  card_id: string;
  tab: string;
  dwell_duration_seconds: number;
  reached_bottom: boolean;
  converted_outbound: boolean;
  extra?: Record<string, unknown>;
}

/**
 * Tracks card dwell duration and engagement depth.
 */
export function trackCardDwellTime(params: {
  card_id: string;
  tab: string;
  dwell_duration_seconds: number;
  reached_bottom: boolean;
  converted_outbound: boolean;
  extra?: Record<string, unknown>;
}): void {
  logUserEvent({
    event_name: 'card_dwell_time',
    tab: params.tab,
    building_id: params.card_id,
    metadata: {
      card_id: params.card_id,
      dwell_duration_seconds: params.dwell_duration_seconds,
      reached_bottom: params.reached_bottom,
      converted_outbound: params.converted_outbound,
      ...(params.extra || {}),
    },
  });
}

export type FormFieldFrictionAction = 'field_focused' | 'field_error' | 'field_completed' | 'form_abandoned';

export interface FormFieldFrictionParams {
  form_type: string;
  action: FormFieldFrictionAction;
  field_name: string;
  error_message?: string;
  extra?: Record<string, unknown>;
}

/**
 * Tracks form field level friction, focus events, validation errors, and abandonment.
 */
export function trackFormFieldFriction(params: {
  form_type: string;
  action: 'field_focused' | 'field_error' | 'field_completed' | 'form_abandoned';
  field_name: string;
  error_message?: string;
  extra?: Record<string, unknown>;
}): void {
  logUserEvent({
    event_name: 'form_field_friction',
    metadata: {
      form_type: params.form_type,
      action: params.action,
      field_name: params.field_name,
      error_message: params.error_message || null,
      ...(params.extra || {}),
    },
  });
}

export type SocialActionType = 'copy_link' | 'copy_phone' | 'share_zalo' | 'share_facebook' | 'copy_address';

export interface SocialActionParams {
  action_type: SocialActionType;
  target_type: string;
  target_id?: string;
  extra?: Record<string, unknown>;
}

/**
 * Tracks social actions, share intents, and clipboard copy interactions.
 */
export function trackSocialAction(params: {
  action_type: 'copy_link' | 'copy_phone' | 'share_zalo' | 'share_facebook' | 'copy_address';
  target_type: string;
  target_id?: string;
  extra?: Record<string, unknown>;
}): void {
  logUserEvent({
    event_name: 'social_action',
    building_id: params.target_type === 'building' ? params.target_id : undefined,
    post_id: params.target_type === 'post' || params.target_type === 'listing' ? params.target_id : undefined,
    metadata: {
      action_type: params.action_type,
      target_type: params.target_type,
      target_id: params.target_id || null,
      ...(params.extra || {}),
    },
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    try {
      const email = typeof traits?.email === 'string' ? traits.email.toLowerCase() : '';
      const isFounderEmail = email.endsWith('@nhaminhbach.com') ||
        ['bachnhatminh0212@gmail.com', 'xuanbach6124@gmail.com'].includes(email);
      const internal = isInternalTester() || isFounderEmail;

      posthog.identify(userId, {
        ...traits,
        ...(internal ? { is_internal: true, $internal_or_test_user: true } : {}),
      });

      if (internal) {
        posthog.register({ is_internal: true, $internal_or_test_user: true });
      }
    } catch {
      // Ignore
    }
  }
}

export function resetTelemetry(): void {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    try {
      posthog.reset();
    } catch {
      // Ignore
    }
  }
}
