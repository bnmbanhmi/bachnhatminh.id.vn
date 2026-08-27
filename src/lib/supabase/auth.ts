import { createClient } from './client'

/**
 * Exchanges a Google Identity Services credential for a Supabase session.
 * Google returns the ID token directly to the browser, so the hosted
 * `<project-ref>.supabase.co` OAuth callback is not shown to the user.
 */
export async function signInWithGoogleIdToken(token: string, nonce: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token,
    nonce,
  })

  return { data, error }
}

/**
 * Signs the user out of all sessions and clears cookies/tokens.
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
