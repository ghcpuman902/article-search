'use server'

import { openai } from '@ai-sdk/openai';
import { kv } from "@vercel/kv";
import { embedMany, embed } from 'ai';
import { Article } from "@/lib/types"
import { customHash, encodeEmbedding, decodeEmbedding } from "@/lib/utils"

const DISABLE_KV_CACHE = true; // Can be controlled via env variable if needed

export interface EmbeddingsData {
  queryEmbedding: Float64Array;
  articleEmbeddings: {
    key: string;
    embedding: Float64Array;
  }[];
}

export async function generateQueryEmbedding(query: string): Promise<Float64Array> {
    'use cache'
    
    if (!DISABLE_KV_CACHE) {
        const cacheKey = 'emb::' + customHash(query)
        const cached = await kv.get(cacheKey)
        
        if (cached) {
            return decodeEmbedding(cached as string)
        }
    }

    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small', {
                dimensions: 512
            }),
            value: query,
        });

        const embeddingArray = new Float64Array(embedding)
        if (!DISABLE_KV_CACHE) {
            const cacheKey = 'emb::' + customHash(query)
            await kv.set(cacheKey, encodeEmbedding(embeddingArray), { ex: 2592000 })
        }
        return embeddingArray
    } catch (error) {
        console.error('Error generating query embedding:', error);
        throw new Error('Failed to generate query embedding. Please try again later.');
    }
}

export async function generateArticleEmbeddings(articles: Article[]): Promise<{
    key: string;
    embedding: Float64Array;
}[]> {
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

    let allEmbeddings: (Float64Array | null)[] = [];
    let missingIndices: number[] = [];

    if (!DISABLE_KV_CACHE) {
        // Check cache for each text individually
        const embeddingPromises = articleTexts.map(async (text, index) => {
            const cacheKey = 'emb::' + articles[index].key
            const cached = await kv.get(cacheKey)
            
            if (cached) {
                return decodeEmbedding(cached as string)
            }
            return null
        })

        allEmbeddings = await Promise.all(embeddingPromises)
        missingIndices = allEmbeddings.map((e, i) => e === null ? i : -1).filter(i => i !== -1)
    } else {
        // If KV cache is disabled, treat all indices as missing
        missingIndices = Array.from({ length: articleTexts.length }, (_, i) => i)
        allEmbeddings = Array(articleTexts.length).fill(null)
    }

    const openaiStartTime = performance.now()
    let openaiDuration = 0
    
    if (missingIndices.length > 0) {
        try {
            const textsToEmbed = missingIndices.map(i => articleTexts[i])
            const { embeddings } = await embedMany({
                model: openai.embedding('text-embedding-3-small', {
                    dimensions: 512
                }),
                values: textsToEmbed,
            });

            openaiDuration = performance.now() - openaiStartTime

            // Update metrics in KV
            await Promise.all([
                kv.incrby('metrics::total_kv_time', Math.round(performance.now() - openaiStartTime)),
                kv.incrby('metrics::total_openai_time', Math.round(openaiDuration)),
                kv.incrby('metrics::total_kv_embeddings', allEmbeddings.length - missingIndices.length),
                kv.incrby('metrics::total_openai_embeddings', missingIndices.length)
            ])

            // Fetch and log metrics
            const [totalKvTime, totalOpenaiTime, totalKvEmbs, totalOpenaiEmbs] = await Promise.all([
                kv.get('metrics::total_kv_time'),
                kv.get('metrics::total_openai_time'),
                kv.get('metrics::total_kv_embeddings'),
                kv.get('metrics::total_openai_embeddings')
            ])

            console.log('📊 Embedding Performance Metrics:')
            console.log(`🔍 KV Cache | hits: ${allEmbeddings.length - missingIndices.length} | misses: ${missingIndices.length}`)
            console.log(`⏱️ Current Request:`)
            console.log(`   KV time: ${performance.now() - openaiStartTime}ms`)
            console.log(`   OpenAI time: ${openaiDuration.toFixed(2)}ms`)
            console.log(`📈 Overall Averages:`)
            console.log(`   KV: ${Number(totalKvEmbs) > 0 ? (Number(totalKvTime) / Number(totalKvEmbs)).toFixed(2) : '0.00'}ms per embedding`)
            console.log(`   OpenAI: ${Number(totalOpenaiEmbs) > 0 ? (Number(totalOpenaiTime) / Number(totalOpenaiEmbs)).toFixed(2) : '0.00'}ms per embedding`)

            // Store new embeddings in cache
            await Promise.all(missingIndices.map(async (originalIndex, i) => {
                const embedding = new Float64Array(embeddings[i])
                const cacheKey = 'emb::' + articles[originalIndex].key
                await kv.set(cacheKey, encodeEmbedding(embedding), { ex: 2592000 })
                allEmbeddings[originalIndex] = embedding
            }))
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw new Error('Failed to generate embeddings. Please try again later.');
        }
    } else {
        console.log('📊 Embedding Performance Metrics:')
        console.log(`🔍 KV Cache | hits: ${allEmbeddings.length} | misses: 0`)
        console.log(`⏱️ Current Request:`)
        console.log(`   KV time: ${performance.now() - openaiStartTime}ms`)
        console.log(`   OpenAI time: 0ms (no API calls needed)`)
    }

    // Return the embeddings with their keys
    return allEmbeddings.map((embedding, index) => {
        const key = articles[index].key
        if (!key) {
            throw new Error(`Article at index ${index} has no key`)
        }
        return {
            key,
            embedding: embedding as Float64Array
        }
    });
}

export async function generateEmbeddings(query: string, articles: Article[]): Promise<EmbeddingsData> {
    'use cache'
    
    const [queryEmbedding, articleEmbeddings] = await Promise.all([
        generateQueryEmbedding(query),
        generateArticleEmbeddings(articles)
    ]);

    return {
        queryEmbedding,
        articleEmbeddings
    };
}
