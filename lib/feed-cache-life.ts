/**
 * Lifetime of the shared RSS snapshot in `fetchAllArticles`.
 *
 * Next.js `cacheLife` (see `node_modules/next/dist/docs/.../cacheLife.md`):
 * - `stale` is the client router cache, not Cache-Control. 30s is the
 *   minimum that still prefetches. It is also under the 5 minute app-shell
 *   threshold, so the article list is not frozen into the static shell while
 *   dynamic holes (the "Server page render" timestamp) keep updating.
 * - `revalidate` is how often the server may serve this snapshot. One hour
 *   matches the on-page "fetched every hour" copy.
 * - `expire` must be greater than `revalidate`. One second later, the next
 *   request blocks on a fresh fetch instead of stale-while-revalidate, so
 *   that response is the new list. A normal reload is enough; a hard refresh
 *   is not required.
 */
export const FEED_CACHE_STALE_SECONDS = 30
export const FEED_CACHE_REVALIDATE_SECONDS = 60 * 60
export const FEED_CACHE_EXPIRE_SECONDS = FEED_CACHE_REVALIDATE_SECONDS + 1
