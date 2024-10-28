'use client'

import { ArticleCard } from "./article-card"
import { getDictionary } from "../lib/utils"
import Link from 'next/link'

import { Article } from "../lib/types"

type ArticlesGridProps = {
  locale: string
  initialArticles: Article[]
  updateTime: string
  initialSearchParams: string
}

export function ArticlesGrid({ locale, initialArticles, updateTime, initialSearchParams }: ArticlesGridProps) {
  const dict = getDictionary(locale)

  // Parse initialSearchParams
  const searchParams = JSON.parse(initialSearchParams)
  const queryString = searchParams.q || ''
  const sortingMethod = searchParams.sort || 'relevance'
  const filterByDays = parseInt(searchParams.days || '4')

  const visibleArticles = initialArticles.filter(article => !article.hidden)

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
        <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
          {dict.title.articles_in_past_days
            .replace("[NUMBER]", visibleArticles.length.toString())
            .replace("[DAYS]", filterByDays.toString())
          } | "{queryString}" | {dict.label.sort_by} {sortingMethod == "relevance" ? dict.label.relevance : dict.label.date} | {dict.label.filter_by} {
            filterByDays == 30 ? dict.label["one-month"] :
            filterByDays == 7 ? dict.label["one-week"] :
            filterByDays == 4 ? dict.label["four-days"] :
            filterByDays == 2 ? dict.label["fourty-eight-hours"] : ''
          }
        </span>
      </div>
      <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleArticles.map((article) => (
          <ArticleCard locale={locale} key={article.key} article={article} />
        ))}
      </div>
      <div className="flex justify-center my-3 items-center gap-x-5">
        <div><Link href="/works/article-search/jp" className='hover:underline'>🇯🇵日本語版</Link></div>
        {/* Removed the "Clear All Data" button as it's no longer needed for static rendering */}
      </div>
      <div className="mt-4 md:mt-8 flex flex-col w-full items-center text-neutral-400">
        server articles: {JSON.stringify(updateTime, null, 2)}
      </div>
    </>
  )
}


// 'use client'

// import { useRouter, usePathname, useSearchParams } from 'next/navigation'
// import { useEffect, useRef, useState, useCallback } from 'react'
// import { Button } from "@/components/ui/button"
// import { toast } from "sonner"
// import { ArticleCard } from "./article-card"
// import { initializeCache, getCacheArticles, updateCacheArticles, searchCacheQueryEmbedding, appendCacheQueryEmbedding, borrowCacheEmbeddings, returnCacheEmbeddings, clearAllData } from '../lib/local-articles'
// import { dotProduct, timeAgo, getDictionary, customHash } from "../lib/utils"
// import { gzip } from 'pako'
// import Link from 'next/link'

// type Article = {
//   title: string
//   link: string
//   pubDate: string
//   description: string
//   image: string
//   source: string
//   distance: number | null
//   embedding: number[] | null
//   key: string
//   hidden: boolean
// }

// type ArticlesGridProps = {
//   locale: string
//   initialArticles: Article[]
//   updateTime: string
//   initialSearchParams: string
// }

// export function ArticlesGrid({ locale, initialArticles, updateTime, initialSearchParams }: ArticlesGridProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()
//   const dict = getDictionary(locale)

//   const [loading, setLoading] = useState(0)
//   const [queryString, setQueryString] = useState('')
//   const [sortingMethod, setSortingMethod] = useState('relevance')
//   const [filterByDays, setFilterByDays] = useState(4)
//   const [lArticles, setLArticles] = useState(initialArticles)
//   const queryEmbedding = useRef<number[] | null>(null)

//   const batchEmbeddingUrl = '/works/article-search/api/batch-embedding-kv'

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams)
//       params.set(name, value)
//       return params.toString()
//     },
//     [searchParams]
//   )

//   const sortArticles = useCallback((arts: Article[]) => {
//     const daysAgo = Date.now() - (filterByDays ? filterByDays : 4) * 24 * 60 * 60 * 1000

//     const filteredArticles = arts.map(art => {
//       const pubDate = new Date(art.pubDate)
//       const articleDateInMs = pubDate.getTime()
//       return { ...art, hidden: !(articleDateInMs >= daysAgo) }
//     })

//     filteredArticles.sort((a, b) => {
//       const aDate = new Date(a.pubDate)
//       const bDate = new Date(b.pubDate)
//       return bDate.getTime() - aDate.getTime()
//     })

//     if (sortingMethod === 'date') {
//       return filteredArticles
//     }

//     return filteredArticles.sort((a, b) => {
//       if (!a.hasOwnProperty('distance') || a.distance == null) return 1
//       if (!b.hasOwnProperty('distance') || b.distance == null) return -1
//       return b.distance - a.distance
//     })
//   }, [filterByDays, sortingMethod])

//   const getQueryEmbedding = useCallback(async (query: string) => {
//     if (query == '') {
//       console.error(`getQueryEmbedding: query empty!`)
//       return
//     }
//     try {
//       query = query.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 280)
//       const cachedQueryEmbedding = await searchCacheQueryEmbedding(query)
//       if (cachedQueryEmbedding !== null && cachedQueryEmbedding !== undefined && cachedQueryEmbedding.length !== 0) {
//         console.log(`using cached targetEmbedding`)
//         return cachedQueryEmbedding
//       } else {
//         console.log(`fetching targetEmbeddings`)
//         const res = await fetch('/works/article-search/api/embedding', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ query }),
//         })
//         if (!res.ok) {
//           throw new Error('Failed to fetch')
//         }
//         const resJson = await res.json()
//         const targetEmbedding = resJson.result
//         appendCacheQueryEmbedding({ query, embedding: targetEmbedding })
//         return targetEmbedding
//       }
//     } catch (error) {
//       console.error(`Error with getting embedding for query: ${error}`)
//     }
//   }, [])

//   useEffect(() => {
//     const updateEmbeddings = async (articles: Article[], targetEmbedding: number[], updateRestFlag = false) => {
//       let articlesToFetchEmbeddingsFor: { article: Article; hashedTitle: string }[] = []
//       const cacheEmbeddings = await borrowCacheEmbeddings()

//       for (const article of articles) {
//         if ((!article.hidden) ^ updateRestFlag) {
//           const hashedTitle = `AS::${customHash(`${article.title}||||${article.description.replace(/\n|\t|[ ]{4}/g, '').replace(/<[^>]*>/g, '')}`)}`
//           const cachedEmbedding = cacheEmbeddings[hashedTitle]

//           if (cachedEmbedding) {
//             article.embedding = cachedEmbedding
//             console.log(`local cache hit`)
//             article.distance = dotProduct(article.embedding, targetEmbedding)
//           } else {
//             articlesToFetchEmbeddingsFor.push({ article, hashedTitle })
//           }
//         }
//       }

//       if (articlesToFetchEmbeddingsFor.length) {
//         const res = await fetch(batchEmbeddingUrl, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Content-Encoding': 'gzip',
//           },
//           body: gzip(JSON.stringify({
//             texts: articlesToFetchEmbeddingsFor.map(({ article }) => `${article.title}||||${article.description.replace(/\n|\t|[ ]{4}/g, '').replace(/<[^>]*>/g, '')}`)
//           })),
//         })

//         const arrayBuffer = await res.arrayBuffer()
//         let embeddingsResult = new Float64Array(arrayBuffer)

//         const embeddingSize = 1536
//         articlesToFetchEmbeddingsFor.forEach((item, i) => {
//           let start = i * embeddingSize
//           let end = start + embeddingSize
//           item.article.embedding = Array.from(embeddingsResult.slice(start, end))
//           item.article.distance = dotProduct(item.article.embedding, targetEmbedding)
//           cacheEmbeddings[item.hashedTitle] = item.article.embedding
//           console.log(`setting cache for ${item.hashedTitle}`)
//         })

//         returnCacheEmbeddings(cacheEmbeddings).catch(error => console.error(`Failed to update cache: ${error}`))
//       }

//       return articles
//     }

//     const fetchData = async () => {
//       await initializeCache()
//       const [cArticles, cUpdateTime, cLocale] = await getCacheArticles()

//       let action = ''

//       if (cUpdateTime) {
//         if ((new Date(cUpdateTime) - new Date(updateTime)) >= 0) {
//           if (cLocale && cLocale === locale) {
//             action = 'use cA'
//             console.log(`cache was fresh and locale matched`)
//           } else {
//             action = 'use A'
//             console.log(`cache was fresh but locale did not match`)
//           }
//         } else {
//           action = 'use A'
//           console.log(`server articles newer than cache`)
//         }
//       } else {
//         action = 'use A'
//         console.log(`cache do not exist`)
//       }

//       if (action === 'use A') {
//         try {
//           console.log(`using server articles, attempt to add embeddings`)
//           toast({
//             description: `${dict.toast_text.using_server}${timeAgo(updateTime, locale)}`,
//           })
//           queryEmbedding.current = await getQueryEmbedding(queryString)

//           const partiallyAddEmbeddings = async (articlesWithoutEmbeddings: Article[]) => {
//             console.log(`updating displaying articles (fetching individual embeddings + calculate distance)`)
//             const updatedArticles = await updateEmbeddings(articlesWithoutEmbeddings, queryEmbedding.current!)
//             console.log(`sorting articles`)
//             const sortedAndUpdatedArticles = sortArticles(updatedArticles)
//             setLArticles(sortedAndUpdatedArticles)
//             setLoading(200)
//             const fullyAddEmbeddings = async (articlesWithSomeEmbeddings: Article[]) => {
//               console.log(`updating remaining articles (fetching individual embeddings + calculate distance)`)
//               const updatedArticles = await updateEmbeddings(articlesWithSomeEmbeddings, queryEmbedding.current!, true)
//               console.log(`sorting articles`)
//               const sortedAndUpdatedArticles = sortArticles(updatedArticles)
//               setLArticles(sortedAndUpdatedArticles)
//               updateCacheArticles({ articles: sortedAndUpdatedArticles, updateTime: updateTime, locale: locale })
//             }
//             fullyAddEmbeddings(sortedAndUpdatedArticles)
//           }
//           setLoading(3)
//           partiallyAddEmbeddings(initialArticles)
//         } catch (error) {
//           throw new Error(`something went wrong! please let the developer know!\n${JSON.stringify(error, null, 2)}`)
//         }
//       } else if (action === 'use cA') {
//         console.log(`using cached articles`)
//         const sortedAndUpdatedArticles = sortArticles(cArticles)
//         setLArticles(sortedAndUpdatedArticles)
//         setLoading(200)
//         toast({
//           description: `${dict.toast_text.using_local_cache}${timeAgo(cUpdateTime, locale)}`,
//         })
//       }
//     }
//     fetchData()
//   }, [])

//   useEffect(() => {
//     if (loading >= 200) {
//       setLoading(0)
//       async function reorderArticlesByDate() {
//         console.log(`re-ordering articles, sortingMethod or filterByDays changed`)
//         const sortedAndUpdatedArticles = sortArticles(lArticles)
//         setLArticles(sortedAndUpdatedArticles)
//         updateCacheArticles({ articles: sortedAndUpdatedArticles, updateTime: updateTime, locale: locale })
//         setLoading(200)
//       }
//       reorderArticlesByDate()
//     }
//   }, [sortingMethod, filterByDays])

//   const reorderArticlesByDistance = async (query: string, arts: Article[]) => {
//     if (query == '' || !arts) {
//       return
//     }
//     queryEmbedding.current = await getQueryEmbedding(query)
//     console.log(`${query} ${JSON.stringify(queryEmbedding.current).slice(0, 100)}`)
//     const updatedArticles = arts.map((article) => {
//       article.distance = dotProduct(article.embedding!, queryEmbedding.current!)
//       return article
//     })
//     const sortedAndUpdatedArticles = sortArticles(updatedArticles)
//     setLArticles(sortedAndUpdatedArticles)
//     updateCacheArticles({ articles: sortedAndUpdatedArticles, updateTime: updateTime, locale: locale })
//     setLoading(200)
//   }

//   useEffect(() => {
//     if (loading >= 200) {
//       if (queryString == '' || !lArticles) {
//         return
//       }
//       setLoading(0)
//       console.log(`re-sorting articles after queryString changed`)
//       router.push(pathname + '?' + createQueryString('q', queryString))
//       reorderArticlesByDistance(queryString, lArticles)
//     }
//   }, [queryString])

//   useEffect(() => {
//     if (!searchParams.has('q') || !searchParams.get('q') || !lArticles || searchParams.get('q') === queryString) {
//       return
//     }
//     setQueryString(searchParams.get('q')!)
//     setLoading(0)
//     console.log(`re-sorting articles after page nav`)
//     reorderArticlesByDistance(searchParams.get('q')!, lArticles)
//   }, [searchParams])

//   const boxShadow = "0px 2px 2px -1px rgba(100, 100, 100, 0.1), inset 0px -1px 4px 0px rgba(100, 100, 100, 0.05)"

//   return (
//     <>
//       <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
//         <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200  shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70"
//           style={{ boxShadow }}>
//           {lArticles
//             ? dict.title.articles_in_past_days
//                 .replace("[NUMBER]", lArticles.filter(article => !article.hidden).length.toString())
//                 .replace("[DAYS]", filterByDays.toString())
//             : 'fetching articles'
//           } | "{queryString}" | {dict.label.sort_by} {sortingMethod == "relevance" ? dict.label.relevance : dict.label.date} | {dict.label.filter_by} {
//             filterByDays == 30 ? dict.label["one-month"] :
//             filterByDays == 7 ? dict.label["one-week"] :
//             filterByDays == 4 ? dict.label["four-days"] :
//             filterByDays == 2 ? dict.label["fourty-eight-hours"] : ''
//           }
//         </span>
//       </div>
//       <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
//         {lArticles
//           ? lArticles.map((article) => (
//               !article.hidden ? <ArticleCard locale={locale} key={article.key} article={article} /> : null
//             ))
//           : null
//         }
//       </div>
//       <div className="flex justify-center my-3 items-center gap-x-5">
//         <div><Link href="/works/article-search/jp" className='hover:underline'>🇯🇵日本語版</Link></div>
//         <div>{dict.label['having-issues']}<Button variant="outline" onClick={() => { clearAllData() }}>{dict.button['clear-all-data']}</Button></div>
//       </div>
//       <div className="mt-4 md:mt-8 flex flex-col w-full items-center text-neutral-400" suppressHydrationWarning>
//         server articles: {JSON.stringify(updateTime, null, 2)} ({timeAgo(updateTime)})
//       </div>
//     </>
//   )
// }