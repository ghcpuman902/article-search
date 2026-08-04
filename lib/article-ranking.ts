import { cosineSimilarity } from 'ai'

import { generateArticleEmbeddings, generateQueryEmbedding } from '@/app/actions/getEmbeddings'
import { Article, SortOption } from '@/lib/types'
import { linkToKey } from '@/lib/utils'

export const DEFAULT_FILTER_DAYS = 4
export const TOP_REC_COUNT = 10

export const filterArticles = (articles: Article[], filterByDays: number): Article[] => {
  const currentTime = Date.now()
  const daysInMs = filterByDays * 24 * 60 * 60 * 1000

  return articles
    .filter((article, index, self) =>
      index === self.findIndex(a => linkToKey(a.link) === linkToKey(article.link))
    )
    .map(article => ({
      ...article,
      hidden: (currentTime - new Date(article.pubDate).getTime()) > daysInMs
    }))
}

const sortByDateDesc = (articles: Article[]): Article[] =>
  [...articles].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

export const rankArticles = async (
  articles: Article[],
  {
    queryString,
    sortingMethod,
    filterByDays,
  }: {
    queryString: string
    sortingMethod: SortOption
    filterByDays: number
  }
): Promise<{ sortedArticles: Article[]; relevanceError: boolean }> => {
  const filteredArticles = filterArticles(articles, filterByDays)
  const visibleArticles = filteredArticles.filter(article => !article.hidden)

  if (!visibleArticles.length) {
    return { sortedArticles: [], relevanceError: false }
  }

  if (sortingMethod !== 'relevance' || !queryString) {
    return { sortedArticles: sortByDateDesc(visibleArticles), relevanceError: false }
  }

  try {
    const [articleEmbeddings, queryEmbedding] = await Promise.all([
      generateArticleEmbeddings(visibleArticles),
      generateQueryEmbedding(queryString),
    ])

    if (!articleEmbeddings?.length) {
      return { sortedArticles: sortByDateDesc(visibleArticles), relevanceError: true }
    }

    const sortedArticles = visibleArticles
      .map(article => {
        const articleEmbedding = articleEmbeddings.find(e => e.key === article.key)
        const distance = articleEmbedding
          ? 1 - cosineSimilarity(
              Array.from(queryEmbedding),
              Array.from(articleEmbedding.embedding)
            )
          : Infinity
        return { ...article, distance }
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))

    return { sortedArticles, relevanceError: false }
  } catch (error) {
    console.error('Error generating embeddings, falling back to date sort:', error)
    return { sortedArticles: sortByDateDesc(visibleArticles), relevanceError: true }
  }
}

export const formatArticlesAsText = (
  articles: Article[],
  limit = TOP_REC_COUNT
): string =>
  articles
    .slice(0, limit)
    .map(article => `${article.title}\n${article.link}`)
    .join('\n\n')
