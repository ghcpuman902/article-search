'use server'

import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { Article } from "@/lib/types"
import { linkToKey } from "@/lib/utils"

import {
  cacheTag,
  cacheLife,
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
            model: openai.textEmbeddingModel('text-embedding-3-small'),
            value: query,
            providerOptions: {
                openai: {
                    dimensions: 512,
                },
            },
        });

        return new Float64Array(embedding);
    } catch (error) {
        console.error('Error generating query embedding:', error);
        throw new Error('Failed to generate query embedding. Please try again later.');
    }
}

const buildArticleEmbeddingText = (article: Article): string => {
    const date = new Date(article.pubDate).toISOString().split('T')[0];
    return `Title: ${article.title}
Source: ${article.source}
Published: ${date}
URL: ${article.link}
${article.image ? `![Article image](${article.image})` : ''}
Content: ${article.description.replace(/\n|\t|[ ]{4}/g, ' ').replace(/<[^>]*>/g, '')}`
};

// Cached per article (keyed on article.key), not per batch. Batching all
// articles into a single embedMany() call meant one new/changed RSS item
// invalidated the whole cache entry and re-embedded every article again on
// every relevance-sorted page load. OpenAI's own prompt caching does not
// apply to the embeddings endpoint (it's chat/completions-only), so this
// per-article Next.js cache is the only lever here - it's what keeps
// steady-state traffic from re-paying for embeddings of articles that
// haven't changed since the last fetch.
const getArticleEmbedding = async (key: string, text: string): Promise<Float64Array> => {
    'use cache: remote'
    cacheTag('article-embeddings', `article-embedding-${key}`)
    cacheLife('days')

    const { embedding } = await embed({
        model: openai.textEmbeddingModel('text-embedding-3-small'),
        value: text,
        providerOptions: {
            openai: {
                dimensions: 512,
            },
        },
    });

    return new Float64Array(embedding);
}

export async function generateArticleEmbeddings(articles: Article[]): Promise<{
    key: string;
    embedding: Float64Array;
}[]> {
    if (!articles || articles.length === 0) {
        console.warn('No articles provided to generateArticleEmbeddings');
        return [];
    }

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
        console.warn('No valid articles to process after filtering');
        return [];
    }

    try {
        return await Promise.all(
            validArticles.map(async article => ({
                key: article.key as string,
                embedding: await getArticleEmbedding(article.key as string, buildArticleEmbeddingText(article)),
            }))
        );
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
