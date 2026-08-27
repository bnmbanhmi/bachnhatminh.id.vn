import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Creates or retrieves the browser-safe Supabase client singleton.
 * Safe to call from client components.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zenwkoyhlkfspfemrudl.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_puiMeoVyHvSGGxqZRItvtQ_GE_tnfaA'

  if (typeof window === 'undefined') {
    // If called on the server, return a new client instance per request
    return createBrowserClient<Database>(
      url,
      anonKey
    )
  }

  if (!client) {
    client = createBrowserClient<Database>(
      url,
      anonKey
    )
  }

  return client
}
