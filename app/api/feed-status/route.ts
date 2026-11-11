import { connection } from 'next/server'

import { toFeedSnapshotIso } from '@/lib/feed-cache-life'
import { fetchAllArticles } from '@/lib/fetch-articles'
import { isFeedRefreshInFlight } from '@/lib/feed-refresh'
import { RSS_SOURCES } from '@/lib/rss-sources'

export const instant = false

/**
 * Cheap read of the shared feed snapshot. The page already started the single
 * background refresh when the snapshot was due; this lets the client compare
 * timestamps and swap the list in once, without downloading it on every poll.
 */
export async function GET(request: Request) {
  await connection()

  const category = new URL(request.url).searchParams.get('category') ?? ''
  if (!RSS_SOURCES[category]) {
    return Response.json({ error: 'Unknown category' }, { status: 400 })
  }

  const snapshot = await fetchAllArticles(category)

  return Response.json(
    {
      updateTime: toFeedSnapshotIso(snapshot.updateTime),
      refreshing: isFeedRefreshInFlight(category),
    },
    { headers: { 'Cache-Control': 'private, no-cache, no-store' } }
  )
}
