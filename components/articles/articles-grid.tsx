import React from 'react'
import { Suspense } from 'react'
import { formatDate, getDictionary } from "@/lib/utils"
import { Article, SortOption, UnifiedSearchParams } from "@/lib/types"
import { Pagination } from "@/components/articles/pagination"
import { VirtualizedArticlesList } from './virtualized-articles-list'
import { StatusBar } from './status-bar'
import {
  TOP_REC_COUNT,
  formatArticlesAsText,
  rankArticles,
} from '@/lib/article-ranking'

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

  const { sortedArticles, relevanceError } = await rankArticles(initialArticles, {
    queryString,
    sortingMethod,
    filterByDays,
  });

  // Show message if no articles are available
  if (!sortedArticles.length) {
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

  const visibleArticlesCount = sortedArticles.length;
  const totalPages = Math.max(1, Math.ceil(visibleArticlesCount / ARTICLES_PER_PAGE));
  const recommendationText = formatArticlesAsText(sortedArticles, TOP_REC_COUNT);

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
        recommendationText={recommendationText}
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
