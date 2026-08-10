import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { ipAddress, waitUntil } from '@vercel/functions'

import { getRedis } from '@/lib/redis'

type RateLimitKind = 'rec' | 'cron'

const limiters: Partial<Record<RateLimitKind, Ratelimit>> = {}

const getLimiter = (kind: RateLimitKind): Ratelimit => {
  const existing = limiters[kind]
  if (existing) {
    return existing
  }

  const redis = getRedis()

  const limiter =
    kind === 'rec'
      ? // Public text endpoint that can trigger embeddings — keep abuse cheap.
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(30, '1 m'),
          prefix: 'rl:rec',
          analytics: true,
          enableProtection: true,
        })
      : // Defense-in-depth for cron/auth probing (real cron still needs CRON_SECRET).
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(20, '1 m'),
          prefix: 'rl:cron',
          analytics: true,
        })

  limiters[kind] = limiter
  return limiter
}

export type RateLimitResult =
  | { ok: true; headers: Headers }
  | { ok: false; response: Response }

const buildHeaders = (remaining: number, reset: number, limit: number): Headers => {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', String(limit))
  headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining)))
  headers.set('X-RateLimit-Reset', String(reset))
  return headers
}

/**
 * IP-based rate limit for Route Handlers. Fail-open if Redis is misconfigured
 * so a cache outage doesn't take the whole site down — cron still requires CRON_SECRET.
 */
export const enforceRateLimit = async (
  request: Request,
  kind: RateLimitKind
): Promise<RateLimitResult> => {
  try {
    const ip = ipAddress(request) ?? 'anonymous'
    const userAgent = request.headers.get('user-agent') ?? undefined
    const limiter = getLimiter(kind)
    const limit = kind === 'rec' ? 30 : 20

    const { success, remaining, reset, pending } = await limiter.limit(`${kind}:${ip}`, {
      ip,
      userAgent,
    })

    // Flush analytics / deny-list sync after the response on Fluid Compute.
    waitUntil(pending)

    const headers = buildHeaders(remaining, reset, limit)

    if (!success) {
      headers.set('Retry-After', String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))))
      return {
        ok: false,
        response: new Response('Too Many Requests', {
          status: 429,
          headers,
        }),
      }
    }

    return { ok: true, headers }
  } catch (error) {
    console.error(`[rate-limit] ${kind} check failed; allowing request:`, error)
    return { ok: true, headers: new Headers() }
  }
}
