import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

/**
 * Creates a server-side Supabase client.
 * Safe to call from React Server Components, Route Handlers, and Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zenwkoyhlkfspfemrudl.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_puiMeoVyHvSGGxqZRItvtQ_GE_tnfaA'

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  )
}
