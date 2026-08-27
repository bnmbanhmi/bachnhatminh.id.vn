'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';
import { identifyUser, resetTelemetry, isInternalTester } from '@/lib/telemetry';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest';

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

  (window as unknown as { posthog?: typeof posthog }).posthog = posthog;

  // Initial register of is_internal super property if already flagged
  if (isInternalTester()) {
    posthog.register({ is_internal: true, $internal_or_test_user: true });
  }
}

function PostHogAuthAndTesterTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Process internal tester URL override (?internal=true/false or ?test_user=1/0)
    if (searchParams) {
      const internalParam = searchParams.get('internal') || searchParams.get('test_user') || searchParams.get('test_mode');
      if (internalParam === 'true' || internalParam === '1') {
        try {
          localStorage.setItem('nmb_is_internal', 'true');
          posthog.register({ is_internal: true, $internal_or_test_user: true });
        } catch {
          // Ignore
        }
      } else if (internalParam === 'false' || internalParam === '0') {
        try {
          localStorage.removeItem('nmb_is_internal');
          posthog.register({ is_internal: false, $internal_or_test_user: false });
        } catch {
          // Ignore
        }
      }
    }

    if (isInternalTester()) {
      posthog.register({ is_internal: true, $internal_or_test_user: true });
    }

    // 2. Supabase auth synchronization
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        identifyUser(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || undefined,
        });
      } else if (event === 'SIGNED_OUT') {
        resetTelemetry();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  return null;
}

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && POSTHOG_KEY) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogAuthAndTesterTracker />
        <PostHogPageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
