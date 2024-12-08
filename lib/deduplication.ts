import { Article } from "@/lib/types"
import { generateEmbeddings } from '@/app/actions/getEmbeddings'
import { cosineSimilarity } from 'ai'

interface DuplicationMetrics {
  processingTime: number
  totalComparisons: number
  duplicatesFound: number
  similarityScores: {
    articleLengths: [number, number]
    similarity: number
  }[]
}

export async function findAndMergeDuplicates(
  articles: Article[],
  similarityThreshold: number = 0.85
): Promise<{ 
  mergedArticles: Article[], 
  metrics: DuplicationMetrics 
}> {
  const startTime = performance.now()
  const metrics: DuplicationMetrics = {
    processingTime: 0,
    totalComparisons: 0,
    duplicatesFound: 0,
    similarityScores: []
  }

  // Generate embeddings for all articles
  const articlesWithEmbeddings = await Promise.all(
    articles.map(async (article) => {
      const content = `${article.title} ${article.description}`
      const embeddingResult = await generateEmbeddings(content, [article])
      return {
        article,
        embedding: embeddingResult.articleEmbeddings[0].embedding,
        contentLength: content.length
      }
    })
  )

  const duplicateGroups: Set<Article>[] = []
  const processedArticles = new Set<string>()

  // Compare each article with every other article
  for (let i = 0; i < articlesWithEmbeddings.length; i++) {
    const current = articlesWithEmbeddings[i]
    if (processedArticles.has(current.article.title)) continue

    const currentGroup = new Set<Article>([current.article])

    for (let j = i + 1; j < articlesWithEmbeddings.length; j++) {
      const comparison = articlesWithEmbeddings[j]
      if (processedArticles.has(comparison.article.title)) continue

      metrics.totalComparisons++

      // Add null checks and type safety for embeddings
      const currentEmbedding = current.embedding
      const comparisonEmbedding = comparison.embedding

      if (!currentEmbedding || !comparisonEmbedding) {
        console.warn('Missing embedding for article comparison')
        continue
      }

      const similarity = cosineSimilarity(
        Array.from(currentEmbedding),
        Array.from(comparisonEmbedding)
      )

      // Store similarity metrics for analysis
      metrics.similarityScores.push({
        articleLengths: [current.contentLength, comparison.contentLength],
        similarity
      })

      if (similarity >= similarityThreshold) {
        currentGroup.add(comparison.article)
        processedArticles.add(comparison.article.title)
        metrics.duplicatesFound++
      }
    }

    if (currentGroup.size > 1) {
      duplicateGroups.push(currentGroup)
    }
  }

  // Merge duplicate articles
  const mergedArticles = articles.filter(article => 
    !processedArticles.has(article.title)
  )

  // For each duplicate group, keep the most recent article
  duplicateGroups.forEach(group => {
    const mostRecent = Array.from(group)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())[0]
    mergedArticles.push(mostRecent)
  })

  metrics.processingTime = performance.now() - startTime

  return {
    mergedArticles,
    metrics
  }
}

// Helper function to analyze similarity metrics
export function analyzeSimilarityMetrics(metrics: DuplicationMetrics) {
  const lengthRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 500 },
    { min: 501, max: 1000 },
    { min: 1001, max: Infinity }
  ]

  const analysis = lengthRanges.map(range => {
    const scoresInRange = metrics.similarityScores.filter(score => 
      score.articleLengths[0] >= range.min && 
      score.articleLengths[0] <= range.max &&
      score.articleLengths[1] >= range.min && 
      score.articleLengths[1] <= range.max
    )

    const avgSimilarity = scoresInRange.reduce((sum, score) => 
      sum + score.similarity, 0) / (scoresInRange.length || 1)

    return {
      range: `${range.min}-${range.max === Infinity ? '∞' : range.max}`,
      comparisons: scoresInRange.length,
      averageSimilarity: avgSimilarity
    }
  })

  return {
    totalProcessingTime: `${metrics.processingTime.toFixed(2)}ms`,
    totalComparisons: metrics.totalComparisons,
    duplicatesFound: metrics.duplicatesFound,
    similarityByLength: analysis
  }
} 