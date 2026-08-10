import { NextRequest } from 'next/server'

import { fetchAllArticles } from '@/lib/fetch-articles'
import {
  DEFAULT_FILTER_DAYS,
  TOP_REC_COUNT,
  formatArticlesAsText,
  rankArticles,
} from '@/lib/article-ranking'
import { enforceRateLimit } from '@/lib/rate-limit'
import { RSS_SOURCES } from '@/lib/rss-sources'
import { SortOption } from '@/lib/types'

export const instant = false

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const rate = await enforceRateLimit(request, 'rec')
  if (!rate.ok) {
    return rate.response
  }

  const { category: rawCategory } = await params
  const category = RSS_SOURCES[rawCategory] ? rawCategory : 'astronomy'
  const searchParams = request.nextUrl.searchParams

  const queryString =
    searchParams.get('q') ||
    RSS_SOURCES[category]?.defaultQuery ||
    RSS_SOURCES.astronomy.defaultQuery

  const sortingMethod: SortOption =
    searchParams.get('sort') === 'date' ? 'date' : 'relevance'

  // Default filter duration (4 days) unless an explicit days param is provided
  const daysParam = searchParams.get('days')
  const filterByDays = daysParam
    ? Math.max(1, Math.min(30, parseInt(daysParam, 10) || DEFAULT_FILTER_DAYS))
    : DEFAULT_FILTER_DAYS

  const { articles } = await fetchAllArticles(category)
  const { sortedArticles } = await rankArticles(articles, {
    queryString,
    sortingMethod,
    filterByDays,
    now: Date.now(),
  })

  const text = formatArticlesAsText(sortedArticles, TOP_REC_COUNT)

  return new Response(text || 'No articles found.', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...Object.fromEntries(rate.headers.entries()),
    },
  })
}
