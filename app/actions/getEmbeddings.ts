'use server'

import { openai } from '@ai-sdk/openai';
import { embedMany, embed } from 'ai';
import { Article } from "@/lib/types"
import { linkToKey } from "@/lib/utils"

import {
  // unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife,
  // revalidateTag,
} from 'next/cache'


export interface EmbeddingsData {
  queryEmbedding: Float64Array;
  articleEmbeddings: {
    key: string;
    embedding: Float64Array;
  }[];
}

export async function generateQueryEmbedding(query: string): Promise<Float64Array> {
    'use cache'
    cacheLife("max")
    
    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small', {
                dimensions: 512
            }),
            value: query,
        });

        return new Float64Array(embedding);
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

    const validArticles = articles.filter(article => {
        if (!article.key) {
            if (!article.link) {
                console.error('Skipping article: both key and link are missing', {
                    title: article.title,
                    source: article.source,
                    pubDate: article.pubDate
                });
                return false;
            }
            
            console.warn('Article missing key, using link-based key as fallback', {
                title: article.title,
                link: article.link,
                source: article.source,
                generatedKey: linkToKey(article.link)
            });
            article.key = linkToKey(article.link);
        }

        const missingFields = [];
        if (!article.title) missingFields.push('title');
        if (!article.link) missingFields.push('URL');
        if (!article.source) missingFields.push('source');
        if (!article.pubDate) missingFields.push('pubDate');

        if (missingFields.length > 0) {
            console.warn(`Article has missing optional fields: ${missingFields.join(', ')}`, 
                        `Article preview:`, {
                            key: article.key,
                            title: article.title,
                            link: article.link,
                            source: article.source
                        });
        }
        return true;
    });

    if (validArticles.length === 0) {
        throw new Error('No valid articles to process after filtering');
    }

    const articleTexts = validArticles.map(article => {
        const date = new Date(article.pubDate).toISOString().split('T')[0];
        return `Title: ${article.title}
Source: ${article.source}
Published: ${date}
URL: ${article.link}
${article.image ? `![Article image](${article.image})` : ''}
Content: ${article.description.replace(/\n|\t|[ ]{4}/g, ' ').replace(/<[^>]*>/g, '')}`
    });

    try {
        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-3-small', {
                dimensions: 512
            }),
            values: articleTexts,
        });

        return validArticles.map((article, index) => {
            if (!article.key) {
                if (!article.link) {
                    console.error('Skipping article: both key and link are missing', {
                        title: article.title,
                        source: article.source,
                        pubDate: article.pubDate
                    });
                    throw new Error('Article missing both key and link');
                }
                
                console.warn('Article missing key, using link-based key as fallback', {
                    title: article.title,
                    link: article.link,
                    source: article.source,
                    generatedKey: linkToKey(article.link)
                });
                article.key = linkToKey(article.link);
            }
            
            return {
                key: article.key,
                embedding: new Float64Array(embeddings[index])
            };
        });
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw new Error('Failed to generate embeddings. Please try again later.');
    }
}

export async function generateEmbeddings(query: string, articles: Article[]): Promise<EmbeddingsData> {
    'use cache'
    cacheLife("max")
    
    const [queryEmbedding, articleEmbeddings] = await Promise.all([
        generateQueryEmbedding(query),
        generateArticleEmbeddings(articles)
    ]);

    return {
        queryEmbedding,
        articleEmbeddings
    };
}
