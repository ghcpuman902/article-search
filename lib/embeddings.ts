import 'server-only'

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

const isEmbeddingVector = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length > 0 && typeof value[0] === 'number'

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

const writeCachedEmbeddings = async (
  entries: { key: string; embedding: number[]; ttlSeconds: number }[]
): Promise<void> => {
  if (entries.length === 0) {
    return
  }

  try {
    const redis = getRedis()
    if (entries.length === 1) {
      const [entry] = entries
      await redis.set(entry.key, entry.embedding, { ex: entry.ttlSeconds })
      return
    }

    const pipeline = redis.pipeline()
    for (const entry of entries) {
      pipeline.set(entry.key, entry.embedding, { ex: entry.ttlSeconds })
    }
    await pipeline.exec()
  } catch (error) {
    console.error('Redis SET failed; serving embeddings without cache write:', error)
  }
}

const getCachedEmbedding = async (
  cacheKey: string,
  value: string,
  ttlSeconds: number
): Promise<Float64Array> => {
  try {
    const cached = await getRedis().get<number[]>(cacheKey)
    if (isEmbeddingVector(cached)) {
      return toFloat64Array(cached)
    }
  } catch (error) {
    console.error('Redis GET failed; generating embedding without cache:', error)
  }

  const embedding = await createEmbedding(value)
  await writeCachedEmbeddings([{ key: cacheKey, embedding, ttlSeconds }])
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

  const items = validArticles.map(article => {
    const text = buildArticleEmbeddingText(article)
    return {
      key: article.key as string,
      cacheKey: articleEmbeddingKey(article.key as string, text),
      text,
    }
  })

  try {
    let cached: (number[] | null)[] = items.map(() => null)

    try {
      cached = await getRedis().mget<(number[] | null)[]>(
        ...items.map(item => item.cacheKey)
      )
    } catch (error) {
      console.error('Redis MGET failed; generating embeddings without cache:', error)
    }

    const misses: { index: number; text: string; cacheKey: string }[] = []
    const embeddings: (Float64Array | null)[] = items.map((item, index) => {
      const value = cached[index]
      if (isEmbeddingVector(value)) {
        return toFloat64Array(value)
      }
      misses.push({ index, text: item.text, cacheKey: item.cacheKey })
      return null
    })

    if (misses.length > 0) {
      const created = await Promise.all(
        misses.map(async miss => ({
          ...miss,
          embedding: await createEmbedding(miss.text),
        }))
      )

      await writeCachedEmbeddings(
        created.map(entry => ({
          key: entry.cacheKey,
          embedding: entry.embedding,
          ttlSeconds: ARTICLE_EMBEDDING_TTL_SECONDS,
        }))
      )

      for (const entry of created) {
        embeddings[entry.index] = toFloat64Array(entry.embedding)
      }
    }

    return items.map((item, index) => ({
      key: item.key,
      embedding: embeddings[index] as Float64Array,
    }))
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
