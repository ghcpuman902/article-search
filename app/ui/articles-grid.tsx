import React from 'react'

// import { Suspense } from 'react'
import { ArticleCard } from "./article-card"
import { formatDate, getDictionary } from "@/lib/utils"
import Link from 'next/link'
// import { LoadingCardGrid } from './loading-templates'
import { Article } from "@/lib/types"
import { generateEmbeddings } from '@/app/actions/getEmbeddings'
import { customHash } from "@/lib/utils"

type ArticlesGridProps = {
  locale: string
  articles: Article[]
  updateTime: Date
  params: { [key: string]: string | string[] | undefined; }
}

export async function ArticlesGrid({ locale, articles: initialArticles, updateTime, params }: ArticlesGridProps) {
  const dict = getDictionary(locale)

  const queryString = typeof params.q === 'string' ? params.q : ''
  const sortingMethod = typeof params.sort === 'string' ? params.sort : 'relevance'
  const days = typeof params.days === 'string' ? params.days : '4'
  const filterByDays = Number.isInteger(parseInt(days)) ? parseInt(days) : 4

  const visibleArticles = initialArticles.filter(article => !article.hidden)

  const getFilterText = (days: number) => {
    const filterMap = {
      30: dict.label["one-month"],
      7: dict.label["one-week"],
      4: dict.label["four-days"],
      2: dict.label["fourty-eight-hours"]
    }
    return filterMap[days as keyof typeof filterMap] || dict.label["four-days"]
  }

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
        <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
          {dict.title.articles_in_past_days
            .replace("[NUMBER]", visibleArticles.length.toString())
            .replace("[DAYS]", filterByDays.toString())
          } | &quot;{queryString}&quot; | {dict.label.sort_by} {sortingMethod === "relevance" ? dict.label.relevance : dict.label.date} | {dict.label.filter_by} {getFilterText(filterByDays)}
        </span>
      </div>
      {/* <Suspense fallback={<LoadingCardGrid />}> */}
        <ArticleList
          articles={visibleArticles}
          queryString={queryString}
          sortingMethod={sortingMethod}
          locale={locale}
        />
      {/* </Suspense> */}
      <div className="flex justify-center my-3 items-center gap-x-5">
        <div><Link href="/jp" className='hover:underline'>🇯🇵日本語版</Link></div>
      </div>
      <div className="mt-4 md:mt-8 flex flex-col w-full items-center text-neutral-400">
        server articles: {formatDate(updateTime)}
      </div>
    </>
  )
}

async function ArticleList({ articles, queryString, sortingMethod, locale }: {
  articles: Article[],
  queryString: string,
  sortingMethod: string,
  locale: string
}) {
  let sortedArticles = articles

  if (queryString && sortingMethod === 'relevance') {
    sortedArticles = await generateEmbeddings(queryString, articles)
  }

  return (
    <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sortedArticles.map((article) => (
        <ArticleCard
          locale={locale}
          key={customHash(`${article.title}||||${article.description.replace(/\n|\t|[ ]{4}/g, '').replace(/<[^>]*>/g, '')}`)}
          article={article}
        />
      ))}
      {/* <div className="mt-4">
        <h3 className="text-lg font-semibold">All Distances</h3>
        <pre className="bg-gray-100 p-2 rounded">
          cosine_distances = np.array([
          {sortedArticles.map(article => (
            article.distance !== undefined ? (
              `${article.distance},`
            ) : (
              `No distances available`
            )
          ))}
          ])
        </pre>
      </div> */}
    </div>
  )
}