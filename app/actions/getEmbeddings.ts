'use server'

import { embed } from 'ai'
import { Article } from '@/lib/types'
import { customHash, linkToKey } from '@/lib/utils'
import { getRedis } from '@/lib/redis'

const EMBEDDING_MODEL = 'openai/text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 512
const EMBEDDING_CACHE_VERSION = 'v1'

/** Article embeddings: ~7 days */
const ARTICLE_EMBEDDING_TTL_SECONDS = 7 * 24 * 60 * 60
/** Query embeddings: ~30 days */
const QUERY_EMBEDDING_TTL_SECONDS = 30 * 24 * 60 * 60

export interface EmbeddingsData {
  queryEmbedding: Float64Array
  articleEmbeddings: {
    key: string
    embedding: Float64Array
  }[]
}

const articleEmbeddingKey = (key: string, text: string): string =>
  `emb:article:${EMBEDDING_CACHE_VERSION}:${EMBEDDING_DIMENSIONS}:${key}:${customHash(text)}`

const queryEmbeddingKey = (query: string): string =>
  `emb:query:${EMBEDDING_CACHE_VERSION}:${EMBEDDING_DIMENSIONS}:${customHash(query)}`

const toFloat64Array = (value: number[] | Float64Array): Float64Array =>
  value instanceof Float64Array ? value : new Float64Array(value)

const createEmbedding = async (value: string): Promise<number[]> => {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value,
    providerOptions: {
      openai: {
        dimensions: EMBEDDING_DIMENSIONS,
      },
    },
  })
  return embedding
}

const getCachedEmbedding = async (
  cacheKey: string,
  value: string,
  ttlSeconds: number
): Promise<Float64Array> => {
  const redis = getRedis()
  const cached = await redis.get<number[]>(cacheKey)

  if (Array.isArray(cached) && cached.length > 0) {
    return toFloat64Array(cached)
  }

  const embedding = await createEmbedding(value)
  await redis.set(cacheKey, embedding, { ex: ttlSeconds })
  return toFloat64Array(embedding)
}

export async function generateQueryEmbedding(query: string): Promise<Float64Array> {
  try {
    return await getCachedEmbedding(
      queryEmbeddingKey(query),
      query,
      QUERY_EMBEDDING_TTL_SECONDS
    )
  } catch (error) {
    console.error('Error generating query embedding:', error)
    throw new Error('Failed to generate query embedding. Please try again later.')
  }
}

const buildArticleEmbeddingText = (article: Article): string => {
  const date = new Date(article.pubDate).toISOString().split('T')[0]
  return `Title: ${article.title}
Source: ${article.source}
Published: ${date}
URL: ${article.link}
${article.image ? `![Article image](${article.image})` : ''}
Content: ${article.description.replace(/\n|\t|[ ]{4}/g, ' ').replace(/<[^>]*>/g, '')}`
}

const getArticleEmbedding = async (key: string, text: string): Promise<Float64Array> =>
  getCachedEmbedding(
    articleEmbeddingKey(key, text),
    text,
    ARTICLE_EMBEDDING_TTL_SECONDS
  )

export async function generateArticleEmbeddings(articles: Article[]): Promise<{
  key: string
  embedding: Float64Array
}[]> {
  if (!articles || articles.length === 0) {
    console.warn('No articles provided to generateArticleEmbeddings')
    return []
  }

  const validArticles = articles.filter(article => {
    if (!article.key) {
      if (!article.link) {
        console.error('Skipping article: both key and link are missing', {
          title: article.title,
          source: article.source,
          pubDate: article.pubDate,
        })
        return false
      }

      console.warn('Article missing key, using link-based key as fallback', {
        title: article.title,
        link: article.link,
        source: article.source,
        generatedKey: linkToKey(article.link),
      })
      article.key = linkToKey(article.link)
    }

    const missingFields = []
    if (!article.title) missingFields.push('title')
    if (!article.link) missingFields.push('URL')
    if (!article.source) missingFields.push('source')
    if (!article.pubDate) missingFields.push('pubDate')

    if (missingFields.length > 0) {
      console.warn(
        `Article has missing optional fields: ${missingFields.join(', ')}`,
        `Article preview:`,
        {
          key: article.key,
          title: article.title,
          link: article.link,
          source: article.source,
        }
      )
    }
    return true
  })

  if (validArticles.length === 0) {
    console.warn('No valid articles to process after filtering')
    return []
  }

  try {
    return await Promise.all(
      validArticles.map(async article => ({
        key: article.key as string,
        embedding: await getArticleEmbedding(
          article.key as string,
          buildArticleEmbeddingText(article)
        ),
      }))
    )
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw new Error('Failed to generate embeddings. Please try again later.')
  }
}

export async function generateEmbeddings(
  query: string,
  articles: Article[]
): Promise<EmbeddingsData> {
  const [queryEmbedding, articleEmbeddings] = await Promise.all([
    generateQueryEmbedding(query),
    generateArticleEmbeddings(articles),
  ])

  return {
    queryEmbedding,
    articleEmbeddings,
  }
}
