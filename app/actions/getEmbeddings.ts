'use server'

import { openai } from '@ai-sdk/openai';

import { cosineSimilarity, embedMany } from 'ai';
import { Article } from "@/lib/types"
import { customHash } from "@/lib/utils"


export async function generateEmbeddings(query: string, articles: Article[]) {
    'use cache'
    const articleTexts = articles.map(article =>
        `${article.title}||||${article.description.replace(/\n|\t|[ ]{4}/g, '').replace(/<[^>]*>/g, '')}`
    )
    console.log("Generating embeddings for query:", query, articleTexts.join("\n").slice(0, 500))
    const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small', {
            dimensions: 512
        }),
        values: [query, ...articleTexts],
    });
    console.log("Embeddings generated:", embeddings.length)

    const queryEmbedding = embeddings[0]
    const articleEmbeddings = embeddings.slice(1)

    const articlesWithDistances = articles.map((article, index) => {
        const distance = 1 - cosineSimilarity(queryEmbedding, articleEmbeddings[index])
        return {
            ...article,
            distance,
            key: customHash(articleTexts[index])
        }
    })

    return articlesWithDistances.sort((a, b) => a.distance - b.distance)
}
