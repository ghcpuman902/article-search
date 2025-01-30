import React, { memo } from 'react'
import { Suspense } from 'react'
import { Dictionary, formatDate, getDictionary, linkToKey } from "@/lib/utils"
import { Article, SortOption, UnifiedSearchParams } from "@/lib/types"
import { generateArticleEmbeddings, generateQueryEmbedding } from '@/app/actions/getEmbeddings'
import { cosineSimilarity } from 'ai'
import { Pagination } from "@/components/articles/pagination"
import { VirtualizedArticlesList } from './virtualized-articles-list'

// Constants at file level
const FILTER_TEXT_MAP = {
  30: 'one-month',
  7: 'one-week',
  4: 'four-days',
  2: 'fourty-eight-hours'
} as const;

// Constants for pagination - increased due to virtualization optimization
const ARTICLES_PER_PAGE = 100; // Increased from 50 to 100 since we have virtualization now

type ArticlesGridProps = {
  articles: Article[]
  updateTime: Date
  params: UnifiedSearchParams
  locale: string
}

// Create a server component wrapper
function ArticlesList({
  articles,
  locale
}: {
  articles: Article[]
  locale: string
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VirtualizedArticlesList articles={articles} locale={locale} />
    </Suspense>
  );
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
      <div className="scroll-m-20 text-center tracking-tighter md:tracking-tight py-1 px-1 md:px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600">
          {dict.title.articles_in_past_days
            .replace("[NUMBER]", visibleArticlesCount.toString())
            .replace("[DAYS]", filterByDays.toString())
          }
        </span>
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600">
          &quot;{queryString}&quot;
        </span>
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600 inline-block">
          {dict.label.sort_by} {sortingMethod === "relevance" ? dict.label.relevance : dict.label.date}
        </span>
        <span className="px-2 inline-block">
          {dict.label.filter_by} {dict.label[getFilterByKey(filterByDays)]}
        </span>
      </div>
    </div>
  );
});

// Optimized filter function
function filterArticles(articles: Article[], filterByDays: number) {
  const currentTime = Date.now();
  const daysInMs = filterByDays * 24 * 60 * 60 * 1000;

  return articles
    .filter((article, index, self) =>
      index === self.findIndex(a => linkToKey(a.link) === linkToKey(article.link))
    )
    .map(article => ({
      ...article,
      hidden: (currentTime - new Date(article.pubDate).getTime()) > daysInMs
    }));
}

// Optimized ArticlesGrid component
export async function ArticlesGrid({ 
  articles: initialArticles, 
  updateTime, 
  params, 
  locale='en-US' 
}: ArticlesGridProps) {
  const dict = getDictionary(locale);
  
  // Parse params with validation
  const queryString = params.q || '';
  const sortingMethod: SortOption = params.sort === 'date' ? 'date' : 'relevance';
  const filterByDays = Math.max(1, Math.min(30, parseInt(params.days || '4') || 4));
  const currentPage = Math.max(1, parseInt(params.page || '1'));

  // Filter articles
  const filteredArticles = filterArticles(initialArticles, filterByDays);
  const visibleArticles = filteredArticles.filter(article => !article.hidden);

  // Show message if no articles are available
  if (!visibleArticles.length) {
    return (
      <div className="w-full text-center py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">{dict.message.no_articles_found}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {dict.message.try_adjusting_filters}
          </p>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside">
            <li>{dict.message.increase_time_range}</li>
            <li>{dict.message.modify_search_terms}</li>
            <li>{dict.message.check_back_later}</li>
          </ul>
        </div>
      </div>
    );
  }
  
  // Handle async operations
  let sortedArticles: Article[] = [];
  let relevanceError = false;
  
  if (sortingMethod === 'relevance' && queryString && visibleArticles.length > 0) {
    try {
      const [articleEmbeddings, queryEmbedding] = await Promise.all([
        generateArticleEmbeddings(visibleArticles),
        generateQueryEmbedding(queryString)
      ]);

      // Only proceed with similarity sorting if we got embeddings
      if (articleEmbeddings?.length > 0) {
        sortedArticles = visibleArticles
          .map((article) => {
            const articleEmbedding = articleEmbeddings.find(e => e.key === article.key);
            const distance = articleEmbedding
              ? 1 - cosineSimilarity(
                  Array.from(queryEmbedding),
                  Array.from(articleEmbedding.embedding)
                )
              : Infinity;
            return { ...article, distance };
          })
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      } else {
        relevanceError = true;
        sortedArticles = visibleArticles.sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
      }
    } catch (error) {
      console.error('Error generating embeddings, falling back to date sort:', error);
      relevanceError = true;
      sortedArticles = visibleArticles.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
    }
  } else {
    sortedArticles = visibleArticles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  const visibleArticlesCount = sortedArticles.length;
  const totalPages = Math.max(1, Math.ceil(visibleArticlesCount / ARTICLES_PER_PAGE));

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
      
      {relevanceError && sortingMethod === 'relevance' && (
        <div className="w-full max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-amber-800 dark:text-amber-200">
            <p className="text-sm">
              {dict.message.relevance_sort_unavailable}
            </p>
          </div>
        </div>
      )}

      <ArticlesList
        articles={paginatedArticles}
        locale={locale}
      />

      {visibleArticlesCount > ARTICLES_PER_PAGE && (
        <Pagination
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