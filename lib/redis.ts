import { Redis } from '@upstash/redis'

let redis: Redis | null = null

/**
 * Upstash Redis client (replaces deprecated @vercel/kv).
 * Prefer UPSTASH_REDIS_REST_* from Marketplace; fall back to legacy KV_* names.
 */
export const getRedis = (): Redis => {
  if (redis) {
    return redis
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    throw new Error(
      'Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or legacy KV_REST_API_URL / KV_REST_API_TOKEN).'
    )
  }

  redis = new Redis({ url, token })
  return redis
}
