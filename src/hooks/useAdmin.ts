'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAILS = new Set([
  'bachnhatminh0212@gmail.com',
]);

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = (user: { email?: string | null } | null) => {
      if (!isMounted) return;
      const email = user?.email?.toLowerCase() || null;
      if (email && ADMIN_EMAILS.has(email)) {
        setIsAdmin(true);
        setAdminEmail(email);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
      setIsLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => checkAdmin(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const hidePost = useCallback(async (postId: string): Promise<{ success: boolean; error?: string }> => {
    if (!postId) return { success: false, error: 'Missing post ID' };
    try {
      const res = await fetch('/api/admin/posts/hide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to hide post' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }, []);

  return {
    isAdmin,
    adminEmail,
    isLoading,
    hidePost,
  };
}
