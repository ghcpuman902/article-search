'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { formatDate } from '../lib/utils'
import * as htmlparser2 from 'htmlparser2'
import render from 'dom-serializer'

// Types
type Article = {
  title: string
  link: string
  pubDate: number
  description: string
  image: string
  source: string
  distance: number | null
  embedding: any | null
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
  updateTime: string
}

// Constants
const MAX_AGE_IN_MILLISECONDS = 32 * 24 * 60 * 60 * 1000
const HIDE_TIME_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000

const RSS_FEEDS = [
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
]

const RSS_FEED_JP = [
  "https://sorae.info/feed",
  "https://www.nao.ac.jp/atom.xml",
  "http://www.astroarts.co.jp/article/feed.atom",
  "https://subarutelescope.org/jp/atom.xml",
  "https://alma-telescope.jp/news/feed",
  "https://www.jaxa.jp/rss/press_j.rdf"
]

// Helper functions
const linkToKey = (message: string): string => {
  const sanitizedLink = message.replace(/[^a-zA-Z0-9]+/g, '-')
  return sanitizedLink.replace(/^-+|-+$/g, '')
}

const convertMediaToImg = (media: any[]): string => {
  if (Array.isArray(media) && media.length > 0 && media[0].url) {
    const { url: src, title: alt = '' } = media[0]
    let { width, height } = media[0]

    if (!width || !height) {
      const match = src.match(/(\d+)x(\d+)\.[\w\d]+$/i)
      if (match) {
        [width, height] = match.slice(1, 3)
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
  let images: string[] = []

  const traverse = (node: any): string[] => {
    if (node.type === 'root') {
      if (node.children) {
        return node.children.flatMap(traverse).filter(Boolean)
      }
    } else if (node.type === 'text') {
      let text = node.data
      text = text ? text.trim().replace(/\s\s+/g, ' ') : ''
      return text === 'The post' ? [] : [text]
    } else if (node.type === 'tag') {
      if (node.name === 'img' || node.name === 'figure' || node.name === 'picture') {
        images.push(render(node))
        return []
      } else if (node.name === 'p' && node.children && node.children.length >= 1 && node.children[0].type === 'text') {
        let text = node.children[0]?.data
        text = text ? text.trim().replace(/\s\s+/g, ' ') : ''
        return text === 'The post' ? [] : [text]
      } else if (node.name === 'p' && node.children) {
        return node.children.flatMap(traverse).filter(Boolean)
      }
    }
    return []
  }

  const description = traverse(dom).join(' ')
  return { description, images }
}

// Server actions
export const fetchArticlesFromFeed = async (url: string): Promise<Article[]> => {
  let articles: Article[] = []
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
      for (let item of items) {
        const title = item.title || ''
        const link = item.link || ''
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
        let { description, images } = parseDescription(item.description || null)

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
  let allArticles: Article[] = []
  let successfulSources: SuccessfulSource[] = []
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

  return { articles: allArticles, successfulSources, updateTime: formatDate(new Date()) }
}





export const fetchAllArticles = unstable_cache(
  async (): Promise<FetchResult> => {
    console.log(`fetchAllArticles ${formatDate(new Date())}`)
    return fetchArticles(RSS_FEEDS)
  },
  ['fetchAllArticles'],
  { revalidate: 7200, tags: ['articles'] }
)

export const fetchAllJapanArticles = unstable_cache(
  async (): Promise<FetchResult> => {
    console.log(`fetchAllJapanArticles ${formatDate(new Date())}`)
    return fetchArticles(RSS_FEED_JP)
  },
  ['fetchAllJapanArticles'],
  { revalidate: 7200, tags: ['articles'] }
)