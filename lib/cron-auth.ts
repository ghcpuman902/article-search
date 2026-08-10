import 'server-only'

import { timingSafeEqual } from 'node:crypto'

/**
 * Authorize Vercel Cron (and manual) callers via `Authorization: Bearer <CRON_SECRET>`.
 * Uses timing-safe comparison so secret length/content isn't leaked via response timing.
 */
export const assertCronAuthorized = (request: Request): boolean => {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  const expected = Buffer.from(secret)
  const actual = Buffer.from(token)

  if (expected.length !== actual.length) {
    return false
  }

  return timingSafeEqual(expected, actual)
}
