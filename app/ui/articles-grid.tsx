import React from 'react'
import { Suspense } from 'react'
import { ArticleCard } from "./article-card"
import { formatDate, getDictionary, linkToKey } from "@/lib/utils"
import { Article, FilterDaysOption, SortOption, UnifiedSearchParams } from "@/lib/types"
import { generateEmbeddings } from '@/app/actions/getEmbeddings'
import { cosineSimilarity } from 'ai'
type ArticlesGridProps = {
  articles: Article[]
  updateTime: Date
  params: UnifiedSearchParams
  locale: string
}

export async function ArticlesGrid({ articles: initialArticles, updateTime, params, locale='en-US' }: ArticlesGridProps) {
  const dict = getDictionary(locale)

  const queryString = params.q || '';
  const sortingMethod: SortOption = params.sort || 'relevance';
  const days: FilterDaysOption = params.days || '4';
  const filterByDays = parseInt(days) || 4;

  // declared here because it's being used outside of ArticleList
  const filteredArticles = initialArticles
    // Remove duplicates by checking article keys
    .filter((article, index, self) =>
      index === self.findIndex(a => linkToKey(a.link) === linkToKey(article.link))
    )
    .map(article => {
      const currentTime = Date.now();
      const daysInMs = filterByDays * 24 * 60 * 60 * 1000;
      const articleDate = typeof article.pubDate === 'string' 
        ? new Date(article.pubDate).getTime()
        : (article.pubDate && typeof article.pubDate === 'object')
          ? (article.pubDate as Date).getTime()
          : article.pubDate as number;
      
      return {
        ...article,
        hidden: (currentTime - articleDate) > daysInMs
      };
    });

  const ArticlesList = async ({
    filteredArticles,
    queryString,
    sortingMethod
  }: {
    filteredArticles: Article[]
    queryString: string
    sortingMethod: string
  }) => {
    'use cache'
    const displayArticles = filteredArticles.filter(article => !article.hidden);
    let embeddingsData = null;

    if (queryString) {
      embeddingsData = await generateEmbeddings(queryString as string, displayArticles);
    }

    const articlesWithDistances = (() => {
      if (!embeddingsData) return displayArticles;

      const { queryEmbedding, articleEmbeddings } = embeddingsData;

      return displayArticles.map((article) => {
        const articleEmbedding = articleEmbeddings.find(e => e.key === article.key);
        if (!articleEmbedding) return article;

        const distance = 1 - cosineSimilarity(
          Array.from(queryEmbedding ?? []),
          Array.from(articleEmbedding.embedding ?? [])
        );

        return {
          ...article,
          distance
        };
      });
    })();

    const sortedArticles = (() => {
      if (sortingMethod === 'relevance' && queryString) {
        return [...articlesWithDistances].sort((a, b) =>
          (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
      } else {
        return [...articlesWithDistances].sort((a, b) => b.pubDate - a.pubDate);
      }
    })();

    return (
      <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sortedArticles.map((article) => (
          <ArticleCard
            locale={locale}
            key={article.key}
            article={article}
          />
        ))}
      </div>
    );
  }

  const FILTER_TEXT_MAP = {
    30: 'one-month',
    7: 'one-week',
    4: 'four-days',
    2: 'fourty-eight-hours'
  } as const

  const getFilterText = (days: number) =>
    dict.label[FILTER_TEXT_MAP[days as keyof typeof FILTER_TEXT_MAP] ?? 'four-days']

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
        <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
          {dict.title.articles_in_past_days
            .replace("[NUMBER]", filteredArticles.filter(article => !article.hidden).length.toString())
            .replace("[DAYS]", filterByDays.toString())
          } | &quot;{queryString}&quot; | {dict.label.sort_by} {sortingMethod === "relevance" ? dict.label.relevance : dict.label.date} | {dict.label.filter_by} {getFilterText(filterByDays)}
        </span>
      </div>
      <Suspense fallback={
        <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              locale={locale}
              key={article.key}
              article={article}
            />
          ))}
        </div>
      }>
        <ArticlesList
          filteredArticles={filteredArticles}
          queryString={queryString}
          sortingMethod={sortingMethod}
        />
      </Suspense>
      <div className="mt-4 md:mt-8 flex flex-col w-full items-center text-neutral-400">
        server articles: {formatDate(updateTime)}
      </div>
    </>
  )
}