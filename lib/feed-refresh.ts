import 'server-only'

const inflight = new Map<string, number>()

const STALE_INFLIGHT_MS = 60_000

/** Mark the one in-flight RSS refresh for this category. A cache hit does not call this. */
export const noteFeedRefreshStart = (category: string): void => {
  inflight.set(category, Date.now())
}

export const noteFeedRefreshEnd = (category: string): void => {
  inflight.delete(category)
}

export const isFeedRefreshInFlight = (category: string): boolean => {
  const startedAt = inflight.get(category)
  if (startedAt === undefined) {
    return false
  }
  if (Date.now() - startedAt > STALE_INFLIGHT_MS) {
    inflight.delete(category)
    return false
  }
  return true
}
