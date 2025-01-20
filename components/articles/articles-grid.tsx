import React, { memo } from 'react'
import { Suspense } from 'react'
import { ArticleCard } from "./article-card"
import { Dictionary, formatDate, getDictionary, linkToKey } from "@/lib/utils"
import { Article, SortOption, UnifiedSearchParams } from "@/lib/types"
import { generateArticleEmbeddings, generateQueryEmbedding } from '@/app/actions/getEmbeddings'
import { cosineSimilarity } from 'ai'
import { Pagination } from "@/components/articles/pagination"

// Constants at file level
const FILTER_TEXT_MAP = {
  30: 'one-month',
  7: 'one-week',
  4: 'four-days',
  2: 'fourty-eight-hours'
} as const;

// Constants for pagination
const ARTICLES_PER_PAGE = 50;

type ArticlesGridProps = {
  articles: Article[]
  updateTime: Date
  params: UnifiedSearchParams
  locale: string
}

// Create a synchronous memoized component for the article list
const MemoizedArticlesList = memo(function MemoizedArticlesList({
  articles,
  locale
}: {
  articles: Article[]
  locale: string
}) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {articles.map((article, index) => (
        article ? (
          <ArticleCard
            locale={locale}
            key={article.key || `article-${index}`}
            article={article}
          />
        ) : null
      ))}
    </div>
  );
});

// Create an async wrapper component if needed
async function ArticlesList({
  articles,
  locale
}: {
  articles: Article[]
  locale: string
}) {
  return <MemoizedArticlesList articles={articles} locale={locale} />;
}

// Type-safe implementation outside the component
const getFilterByKey = (days: number): string => {
  return FILTER_TEXT_MAP[days as keyof typeof FILTER_TEXT_MAP] ?? 'four-days';
};

// Create a client component for the status bar
const StatusBar = memo(function StatusBar({ 
  dict, 
  visibleArticlesCount, 
  filterByDays, 
  queryString, 
  sortingMethod
}: {
  dict: Dictionary,
  visibleArticlesCount: number,
  filterByDays: number,
  queryString: string,
  sortingMethod: string
}) {
  return (
    <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
      <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
        {dict.title.articles_in_past_days
          .replace("[NUMBER]", visibleArticlesCount.toString())
          .replace("[DAYS]", filterByDays.toString())
        } | &quot;{queryString}&quot; | {dict.label.sort_by} {sortingMethod === "relevance" ? dict.label.relevance : dict.label.date} | {dict.label.filter_by} {dict.label[getFilterByKey(filterByDays)]}
      </span>
    </div>
  );
});

// Move filtering logic to a separate function
function filterArticles(articles: Article[], filterByDays: number) {
  return articles
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
}

// Memoize the Pagination component
const PaginationMemo = memo(Pagination);

export async function ArticlesGrid({ 
  articles: initialArticles, 
  updateTime, 
  params, 
  locale='en-US' 
}: ArticlesGridProps) {
  const dict = getDictionary(locale);
  
  // Parse params
  const queryString = params.q || '';
  const sortingMethod: SortOption = params.sort || 'relevance';
  const filterByDays = parseInt(params.days || '4') || 4;
  const currentPage = parseInt(params.page || '1');

  // Filter articles
  const filteredArticles = filterArticles(initialArticles, filterByDays);
  const visibleArticles = filteredArticles.filter(article => !article.hidden);
  
  // Generate article embeddings for similarity scores in UI
  const articleEmbeddings = await generateArticleEmbeddings(visibleArticles);
  let sortedArticles = visibleArticles;
  
  if (queryString && sortingMethod === 'relevance') {
    // Only generate query embedding if sorting by relevance
    const queryEmbedding = await generateQueryEmbedding(queryString);

    // Sort by relevance
    sortedArticles = visibleArticles.map((article) => {
      const articleEmbedding = articleEmbeddings.find(e => e.key === article.key);
      if (!articleEmbedding) return article;

      const distance = 1 - cosineSimilarity(
        Array.from(queryEmbedding),
        Array.from(articleEmbedding.embedding)
      );

      return { ...article, distance };
    }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } else {
    // Sort by date
    sortedArticles = visibleArticles.sort((a, b) => b.pubDate - a.pubDate);
  }

  const visibleArticlesCount = sortedArticles.length;
  const totalPages = Math.ceil(visibleArticlesCount / ARTICLES_PER_PAGE);

  // Paginate the sorted results
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  return (
    <>
      <StatusBar 
        dict={dict}
        visibleArticlesCount={visibleArticlesCount}
        filterByDays={filterByDays}
        queryString={queryString}
        sortingMethod={sortingMethod}
      />
      
      <Suspense fallback={
        <MemoizedArticlesList
          articles={Array(ARTICLES_PER_PAGE).fill({ 
            key: 'loading',
            title: 'Loading...',
            link: '#',
            pubDate: new Date(),
            // Add other required Article properties with placeholder values
          })}
          locale={locale}
        />
      }>
        <ArticlesList
          articles={paginatedArticles}
          locale={locale}
        />
      </Suspense>

      {visibleArticlesCount > ARTICLES_PER_PAGE && (
        <PaginationMemo
          totalPages={totalPages}
          currentPage={currentPage}
          basePath=""
          searchParams={params}
        />
      )}

      <div className="mt-4 md:mt-8 flex flex-col w-full items-center text-neutral-400">
        server articles: {formatDate(updateTime)}
      </div>
    </>
  );
}