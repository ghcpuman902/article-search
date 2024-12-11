'use server'

import { openai } from '@ai-sdk/openai';
import { kv } from "@vercel/kv";
import { embedMany } from 'ai';
import { Article } from "@/lib/types"
import { customHash, encodeEmbedding, decodeEmbedding } from "@/lib/utils"

export interface EmbeddingsData {
  queryEmbedding: Float64Array;
  articleEmbeddings: {
    key: string;
    embedding: Float64Array;
  }[];
}

export async function generateEmbeddings(query: string, articles: Article[]): Promise<EmbeddingsData> {
    'use cache'

    const articleTexts = articles.map(article => {
        const date = new Date(article.pubDate).toISOString().split('T')[0];
        return `Title: ${article.title}
Source: ${article.source}
Published: ${date}
URL: ${article.link}
${article.image ? `![Article image](${article.image})` : ''}
Content: ${article.description.replace(/\n|\t|[ ]{4}/g, ' ').replace(/<[^>]*>/g, '')}`
    })

    // Check cache for each text individually
    const embeddingPromises = [query, ...articleTexts].map(async (text, index) => {
        const cacheKey = index === 0 
            ? 'emb::' + customHash(text)  // hash for query
            : 'emb::' + articles[index - 1].key  // use article key
        const cached = await kv.get(cacheKey)
        
        if (cached) {
            return decodeEmbedding(cached as string)
        }
        
        return null
    })

    const cachedEmbeddings = await Promise.all(embeddingPromises)
    const missingIndices = cachedEmbeddings.map((e, i) => e === null ? i : -1).filter(i => i !== -1)
    
    console.log(`🔍 KV Embed Cache | hits: ${cachedEmbeddings.length - missingIndices.length} | misses: ${missingIndices.length}`)

    const allEmbeddings = [...cachedEmbeddings]
    
    // If we have any missing embeddings, get them with embedMany
    if (missingIndices.length > 0) {
        try {
            const textsToEmbed = missingIndices.map(i => i === 0 ? query : articleTexts[i - 1])
            const { embeddings } = await embedMany({
                model: openai.embedding('text-embedding-3-small', {
                    dimensions: 512
                }),
                values: textsToEmbed,
            });

            // Cache the new embeddings
            await Promise.all(missingIndices.map(async (originalIndex, i) => {
                const cacheKey = originalIndex === 0
                    ? 'emb::' + customHash(query)  // hash for query
                    : 'emb::' + articles[originalIndex - 1].key  // use article key
                const embedding = new Float64Array(embeddings[i])
                await kv.set(cacheKey, encodeEmbedding(embedding), { ex: 2592000 })
                allEmbeddings[originalIndex] = embedding
            }))
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw new Error('Failed to generate embeddings. Please try again later.');
        }
    }

    // Return the result without caching the full set
    return {
        queryEmbedding: allEmbeddings[0] as Float64Array,
        articleEmbeddings: allEmbeddings.slice(1).map((embedding, index) => {
            const key = articles[index].key;
            if (!key) {
                throw new Error(`Article at index ${index} is missing required 'key' property`);
            }
            return {
                key,
                embedding: embedding as Float64Array
            };
        })
    };
}
