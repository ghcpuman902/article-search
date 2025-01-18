'use server'

import {
  // unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife,
  // revalidateTag,
} from 'next/cache'


import { Article, SuccessfulSource, FetchResult, MediaItem } from '@/lib/types'
import { formatDate, getDomainNameFromUrl, linkToKey } from '@/lib/utils'
import * as htmlparser2 from 'htmlparser2'
import render from 'dom-serializer'
import { Node, Element, Text, AnyNode } from 'domhandler'
import { RSS_SOURCES } from '@/lib/rss-sources'

// Constants
const MAX_AGE_IN_MILLISECONDS = 32 * 24 * 60 * 60 * 1000 // 32 days
const HIDE_TIME_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000 // 4 days

const SPECIAL_CASE_URLS = [
  'nao.ac.jp',
  'astroarts.co.jp',
  'jaxa.jp',
  'sciam.com'
]
// Helper function to check if URL needs special handling
const needsSpecialHandling = (url: string): boolean => {
  return SPECIAL_CASE_URLS.some(domain => url.includes(domain))
}


// helper function to convert media in rss/atom feed to img
const convertMediaToImg = (media: MediaItem[]): string => {
  if (Array.isArray(media) && media.length > 0 && media[0].url) {
    const { url: src, title: alt = '' } = media[0]
    let { width, height } = media[0]

    if (!width || !height) {
      const match = src.match(/(\d+)x(\d+)\.[\w\d]+$/i)
      if (match) {
        [width, height] = match.slice(1, 3).map(Number)
      }
    }

    const widthAndHeight = width && height ? `width="${width}" height="${height}"` : ``
    return `<img src="${src}" alt="${alt}" ${widthAndHeight}>`
  }
  return ''
}

// helper function to parse description in rss/atom feed to description and images
const parseDescription = (oDescription: string | null): { description: string; images: string[] } => {
  if (!oDescription) {
    return { description: '', images: [] }
  }
  const dom = htmlparser2.parseDocument(oDescription)
  const images: string[] = []

  const traverse = (node: Node): string[] => {
    if (node.type === 'root') {
      const rootNode = node as Element
      if (rootNode.children) {
        return rootNode.children.flatMap(traverse).filter(Boolean)
      }
    } else if (node.type === 'text') {
      const textNode = node as Text
      let text = textNode.data
      text = text ? text.trim().replace(/\s\s+/g, ' ') : ''
      return text === 'The post' ? [] : [text]
    } else if (node.type === 'tag') {
      const tagNode = node as Element
      if (tagNode.name === 'img' || tagNode.name === 'figure' || tagNode.name === 'picture') {
        images.push(render(node as AnyNode))
        return []
      } else if (tagNode.name === 'p' && tagNode.children && tagNode.children.length >= 1 && tagNode.children[0].type === 'text') {
        const firstChild = tagNode.children[0] as Text
        let text = firstChild.data
        text = text ? text.trim().replace(/\s\s+/g, ' ') : ''
        return text === 'The post' ? [] : [text]
      } else if (tagNode.name === 'p' && tagNode.children) {
        return tagNode.children.flatMap(traverse).filter(Boolean)
      }
    }
    return []
  }

  const description = traverse(dom).join(' ')
  return { description, images }
}


export const fetchArticlesFromFeed = async (url: string): Promise<Article[]> => {

  const articles: Article[] = []
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // Only use special handling for specific sites
    const useSpecialHandling = needsSpecialHandling(url)
    const targetUrl = useSpecialHandling ? url : url.replace(/^http:/, 'https:')
    
    const response = await fetch(targetUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'PostmanRuntime/7.42.0',
        'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,zh-CN;q=0.6,zh;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
      },
      // Only add performance-critical options for problematic sites
      ...(useSpecialHandling ? {
        cache: 'no-store',
        keepalive: true,
        credentials: 'omit',
        revalidateUnauthorized: false,
        timeout: 15000,
        agent: new (await import('http')).Agent({ 
          keepAlive: true,
          keepAliveMsecs: 3000,
          maxSockets: 1,
        })
      } : {
        cache: 'no-store',
        credentials: 'same-origin'
      }),
      redirect: 'follow',
      //@ts-expect-error - Adding follow-redirects behavior
      maxRedirects: 20
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorMsg = `Failed to fetch ${targetUrl} - Status: ${response.status} ${response.statusText}`
      throw new Error(errorMsg)
    }
    
    const data = await response.text()
    const parsedResult = htmlparser2.parseFeed(data, { xmlMode: true })

    const types = ['rss', 'atom', 'rdf']
    if (!parsedResult) {
      return []
    }
    if (types.includes(parsedResult.type) && parsedResult.items) {
      const items = parsedResult.items
      for (const item of items) {
        const title = item.title || ''
        const link = item.link || ''
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
        const { description, images } = parseDescription(item.description || null)

        const image = convertMediaToImg(item.media || []) || images[0] || ''

        articles.push({
          title,
          link,
          pubDate,
          description,
          image,
          source: url,
          distance: undefined,
          embedding: undefined,
          key: linkToKey(link),
          hidden: false
        })
      }
    } else {
      console.error(`Unexpected XML structure for URL: ${url}, possible type: ${parsedResult.type || 'unknown'}`)
      return []
    }
  } catch (error) {
    console.warn(`Issue fetching feed for URL: ${url}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url,
      cause: error instanceof Error ? error.cause : undefined
    })
    return []
  }
  return articles
}

// Add interface for params
interface FetchAllArticlesParams {
  NO_FILTER?: boolean;
}

export const fetchAllArticles = async (
  category: string = 'astronomy', 
  params: FetchAllArticlesParams = {}
): Promise<FetchResult> => {
  'use cache';
  
  cacheLife({
    stale: 5*60, // 5 minutes
    revalidate: 3600, // 1 hour
    expire: 4*3600, // 2 hours
  })

  // Add debug timestamp before cache configuration
  console.log(`Cache configuration time: ${new Date().toISOString()}`);
  
  // Add request ID to track individual requests
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting fetchAllArticles execution at ${new Date().toISOString()}`);
  
  const { NO_FILTER = false } = params;
  
  console.log(`fetchAllArticles (${category}) ${formatDate(new Date())} start`)
  try {
    const selectedFeeds = RSS_SOURCES[category]?.feeds ?? RSS_SOURCES['astronomy'].feeds
    const currentTime = Date.now()
    
    const results = await Promise.allSettled(
      selectedFeeds.map(url => fetchArticlesFromFeed(url))
    )
    
    const successfulSources: SuccessfulSource[] = []
    let allArticles: Article[] = []

    // Process all results at once
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const articles = result.value;
        const maxAgeCount = articles.filter(a => currentTime - a.pubDate > MAX_AGE_IN_MILLISECONDS).length;
        // Only filter by MAX_AGE if NO_FILTER is false
        const filteredArticles = NO_FILTER ? articles : articles.filter(a => currentTime - a.pubDate <= MAX_AGE_IN_MILLISECONDS);
        
        if (filteredArticles.length > 0) {
          const hiddenCount = filteredArticles.filter(a => currentTime - a.pubDate > HIDE_TIME_IN_MILLISECONDS).length;
          
          successfulSources.push({ 
            url: selectedFeeds[index],
            shown: filteredArticles.length - hiddenCount,
            hidden: hiddenCount,
            maxAge: maxAgeCount,
            total: articles.length
          });
          
          allArticles = allArticles.concat(
            filteredArticles.map(article => ({
              ...article,
              hidden: currentTime - article.pubDate > HIDE_TIME_IN_MILLISECONDS
            }))
          );
        }
      }
    });

    // Calculate totals from successfulSources
    const totals = successfulSources.reduce((acc, source) => ({
      shown: acc.shown + source.shown,
      hidden: acc.hidden + source.hidden,
      maxAge: acc.maxAge + source.maxAge,
      total: acc.total + source.total
    }), { shown: 0, hidden: 0, maxAge: 0, total: 0 });

    // Log using stored values
    console.log(`fetchAllArticles (${category}) ${formatDate(new Date())} completed with ${successfulSources.length}/${selectedFeeds.length} sources:`);
    // Create table data with totals row
    const tableData = [
      {
        source: 'TOTAL',
        shown: totals.shown,
        hidden: totals.hidden,
        maxAge: totals.maxAge,
        total: totals.total
      },
      ...selectedFeeds.map(url => {
        const source = successfulSources.find(s => s.url === url);
        return {
          source: getDomainNameFromUrl(url),
          shown: source?.shown ?? 'failed',
          hidden: source?.hidden ?? 'failed', 
          maxAge: source?.maxAge ?? 'failed',
          total: source?.total ?? 'failed'
        };
      })
    ];

    console.table(tableData);

    // Sort once at the end
    allArticles.sort((a, b) => b.pubDate - a.pubDate)

    // Create final result object
    const finalResult: FetchResult = {
      articles: allArticles,
      successfulSources,
      updateTime: new Date()
    }

    // Add more detailed logging in the results
    console.log(`[${requestId}] Completed fetchAllArticles at ${new Date().toISOString()}`);
    console.log(`[${requestId}] Number of articles fetched: ${allArticles.length}`);

    // Simply return the result, no Promise.resolve needed
    return finalResult
  } catch (error) {
    console.warn(`Warning in fetchAllArticles (${category}):`, error)
    // Simply return the empty result, no Promise.resolve needed
    return {
      articles: [],
      successfulSources: [],
      updateTime: new Date()
    }
  }
}