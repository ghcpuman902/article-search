/**
 * Lifetime of the shared RSS snapshot in `fetchAllArticles`.
 *
 * Next.js 16.4.5 `cacheLife` (`node_modules/next/dist/docs/.../cacheLife.md`):
 * - `stale` is the client router cache. 30s is the minimum that still
 *   prefetches, and it is under 5 minutes so the list stays out of the app shell.
 * - `revalidate` is stale-while-revalidate: once the snapshot is an hour old,
 *   the next request serves it immediately and starts one background refresh.
 * - `expire: Infinity` never drops that snapshot into a blocking refetch, so a
 *   5–15s refresh does not replace the list with a skeleton. A failed refresh
 *   throws and is not stored, which leaves this entry in place.
 */
export const FEED_CACHE_STALE_SECONDS = 30
export const FEED_CACHE_REVALIDATE_SECONDS = 60 * 60
export const FEED_CACHE_EXPIRE_SECONDS = Infinity

export const feedSnapshotTime = (updateTime: Date | string): number =>
  updateTime instanceof Date ? updateTime.getTime() : new Date(updateTime).getTime()

export const isFeedSnapshotOutdated = (
  updateTime: Date | string,
  now = Date.now()
): boolean => {
  const time = feedSnapshotTime(updateTime)
  if (!Number.isFinite(time)) {
    return true
  }
  return now - time >= FEED_CACHE_REVALIDATE_SECONDS * 1000
}

export const toFeedSnapshotIso = (updateTime: Date | string): string => {
  const time = feedSnapshotTime(updateTime)
  return Number.isFinite(time) ? new Date(time).toISOString() : ''
}
