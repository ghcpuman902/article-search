'use server'

import {
  // unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife,
  // revalidateTag,
} from 'next/cache'


import { formatDate } from '@/lib/utils'
import * as htmlparser2 from 'htmlparser2'
import render from 'dom-serializer'
import { Node, Element, Text, AnyNode } from 'domhandler'

// Types
type Article = {
  title: string
  link: string
  pubDate: number
  description: string
  image: string
  source: string
  distance: number | null
  embedding: number[] | null
  key: string
  hidden: boolean
}

type SuccessfulSource = {
  url: string
  count: number
}

type FetchResult = {
  articles: Article[]
  successfulSources: SuccessfulSource[]
  updateTime: Date
}

type MediaItem = {
  url?: string | undefined
  title?: string
  width?: number
  height?: number
}

// Constants
const MAX_AGE_IN_MILLISECONDS = 32 * 24 * 60 * 60 * 1000
const HIDE_TIME_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000

const RSS_FEEDS_BY_LOCALE = {
  'en-US': [
    "https://scitechdaily.com/feed/",
    "https://phys.org/rss-feed/space-news/",
    "https://www.universetoday.com/feed",
    "https://www.space.com/feeds/news",
    "https://www.sciencealert.com/feed",
    "https://skyandtelescope.org/astronomy-news/feed",
    "https://spacenews.com/feed/",
    "http://rss.sciam.com/ScientificAmerican-Global",
    "https://ras.ac.uk/rss.xml",
    "https://www.sci.news/astronomy/feed",
    "https://www.newscientist.com/subject/space/feed/",
    "https://theconversation.com/us/technology/articles.atom"
  ],
  'ja-JP': [
    "https://sorae.info/feed",
    "https://www.nao.ac.jp/atom.xml",
    "http://www.astroarts.co.jp/article/feed.atom",
    "https://subarutelescope.org/jp/atom.xml",
    "https://alma-telescope.jp/news/feed",
    "https://www.jaxa.jp/rss/press_j.rdf"
  ]
} as const

// Helper functions
const linkToKey = (message: string): string => {
  const sanitizedLink = message.replace(/[^a-zA-Z0-9]+/g, '-')
  return sanitizedLink.replace(/^-+|-+$/g, '')
}

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

// Server actions
export const fetchArticlesFromFeed = async (url: string): Promise<Article[]> => {
  const articles: Article[] = []
  try {
    const response = await fetch(url)
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
          distance: null,
          embedding: null,
          key: linkToKey(link),
          hidden: false
        })
      }
    } else {
      console.error(`Unexpected XML structure for URL: ${url}, possible type: ${parsedResult.type || 'unknown'}`)
      return []
    }
  } catch (error) {
    console.error(`Error fetching the feed for URL: ${url}`, error)
    return []
  }
  return articles
}

const fetchArticles = async (urls: string[]): Promise<FetchResult> => {
  'use cache';
  let allArticles: Article[] = []
  const successfulSources: SuccessfulSource[] = []
  const currentTime = Date.now()

  const promises = urls.map(url => fetchArticlesFromFeed(url))
  const results = await Promise.all(promises)

  for (let i = 0; i < results.length; i++) {
    const articles = results[i]
    if (articles.length > 0) {
      successfulSources.push({ url: urls[i], count: articles.length })
      allArticles = allArticles.concat(articles)
    }
  }

  allArticles = allArticles.reduce((acc: Article[], article) => {
    const ageInMilliseconds = currentTime - article.pubDate
    const hidden = ageInMilliseconds > HIDE_TIME_IN_MILLISECONDS

    if (ageInMilliseconds <= MAX_AGE_IN_MILLISECONDS) {
      acc.push({ ...article, hidden })
    }
    return acc
  }, [])

  allArticles.sort((a, b) => b.pubDate - a.pubDate)

  return { articles: allArticles, successfulSources, updateTime: new Date() }
}

export const fetchAllArticles = async (locale: string = 'en-US'): Promise<FetchResult> => {
  'use cache';
  cacheLife({
    stale: 60 * 30, // 30 minutes
    revalidate: 60 * 60 * 1, // 1 hour
    expire: 60 * 60 * 2, // 2 hours
  })
  // cacheTag('articles-and-embeddings')
  console.log(`fetchAllArticles (${locale}) ${formatDate(new Date())}`)
  try {
    const selectedFeeds = RSS_FEEDS_BY_LOCALE[locale as keyof typeof RSS_FEEDS_BY_LOCALE] ?? RSS_FEEDS_BY_LOCALE['en-US']
    const feeds = [...selectedFeeds]
    const result = await fetchArticles(feeds)
    console.log(`fetchAllArticles (${locale}) completed successfully`)
    return result
  } catch (error) {
    console.error(`Error in fetchAllArticles (${locale}):`, error)
    throw error
  }
}