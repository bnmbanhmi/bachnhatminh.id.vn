/**
 * In-Memory Sliding Fixed Window Rate Limiter for Next.js Middleware & Edge Runtimes.
 * Baseline target: 30 requests per minute (60,000ms) per IP on rate-limited endpoints (/api/*, /search).
 */

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetInSeconds: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store per key: `${ip}:${pathGroup}`
const rateLimitMap = new Map<string, RateLimitEntry>()

// Max store entries before triggering stale item sweep
const MAX_CACHE_SIZE = 10000

function sweepExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Checks and updates rate limit for a given IP and pathname.
 */
export function checkRateLimit(
  ip: string,
  pathname: string,
  limit: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now()

  if (rateLimitMap.size > MAX_CACHE_SIZE) {
    sweepExpiredEntries(now)
  }

  const pathGroup = pathname === '/api/media/upload-url'
    ? '/api/media/upload-url'
    : pathname.startsWith('/api/')
      ? 'api'
      : pathname === '/listing' || pathname.startsWith('/listing/') || pathname === '/listings' || pathname.startsWith('/listings/') || pathname === '/building' || pathname.startsWith('/building/') || pathname === '/buildings' || pathname.startsWith('/buildings/') || pathname === '/units' || pathname.startsWith('/units/') || pathname === '/houses' || pathname.startsWith('/houses/') || pathname === '/search' || pathname.startsWith('/search/')
        ? 'listing'
        : 'default'

  const key = `${ip}:${pathGroup}`

  let entry = rateLimitMap.get(key)

  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitMap.set(key, entry)
  } else {
    entry.count += 1
  }

  const remaining = Math.max(0, limit - entry.count)
  const resetInSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000))
  const success = entry.count <= limit

  return {
    success,
    limit,
    remaining,
    resetInSeconds,
  }
}

/**
 * Clears the rate limit cache store (for testing or administrative reset).
 */
export function clearRateLimitStore(): void {
  rateLimitMap.clear()
}

/**
 * Extracts client IP address from Cloudflare, reverse proxy headers, or fallback.
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()

  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',')
    if (ips[0] && ips[0].trim()) return ips[0].trim()
  }

  return '127.0.0.1'
}
