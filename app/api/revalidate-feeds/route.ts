import { revalidatePath, revalidateTag } from 'next/cache'

import { fetchAllArticles } from '@/lib/fetch-articles'
import { assertCronAuthorized } from '@/lib/cron-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { RSS_SOURCES } from '@/lib/rss-sources'

// Triggered by the vercel.ts crons. Marks the tagged snapshot stale with
// the `max` profile so visitors keep the last good list while one refresh
// runs. `updateTag` is Server Actions only. `{ expire: 0 }` would delete
// the snapshot and make the next read block.
export async function GET(request: Request) {
  const rate = await enforceRateLimit(request, 'cron')
  if (!rate.ok) {
    return rate.response
  }

  if (!assertCronAuthorized(request)) {
    return new Response('Unauthorized', { status: 401, headers: rate.headers })
  }

  const { searchParams } = new URL(request.url)
  const requestedCategory = searchParams.get('category')

  const categories = requestedCategory
    ? [requestedCategory]
    : Object.keys(RSS_SOURCES)

  const results = await Promise.allSettled(
    categories.map(async category => {
      if (!RSS_SOURCES[category]) {
        throw new Error(`Unknown category: ${category}`)
      }
      // 'max' serves the current snapshot and refreshes it in the background.
      revalidateTag(`articles-${category}`, 'max')
      revalidatePath(`/${category}`)
      revalidatePath(`/${category}/list`)
      const { articles, successfulSources } = await fetchAllArticles(category)
      return { articleCount: articles.length, sourceCount: successfulSources.length }
    })
  )

  const summary = results.map((result, index) => ({
    category: categories[index],
    ...(result.status === 'fulfilled'
      ? { ok: true, ...result.value }
      : { ok: false, error: result.reason instanceof Error ? result.reason.message : 'Unknown error' }),
  }))

  console.log('revalidate-feeds', JSON.stringify(summary))

  return Response.json(
    { revalidated: summary },
    { headers: rate.headers }
  )
}
