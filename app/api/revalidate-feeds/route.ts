import { updateTag } from 'next/cache'
import { fetchAllArticles } from '@/app/actions/fetchArticles'
import { RSS_SOURCES } from '@/lib/rss-sources'

// Triggered by the vercel.ts crons. Runs the RSS aggregation (and, via
// ArticlesGrid's relevance sort on the next real request, the embedding
// pass) on a schedule instead of on a user's first visit, so the
// 'use cache: remote' entry in fetchAllArticles is already warm when
// traffic arrives.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
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
      // Invalidate first so the subsequent call is a guaranteed cache
      // miss that refetches all feeds and repopulates the remote cache.
      await updateTag(`articles-${category}`)
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

  return Response.json({ revalidated: summary })
}
