export const experimental_ppr = true

import React from 'react'
import { useTranslation } from 'react-i18next';

import { ArticlesGrid } from '@/components/articles/articles-grid'
import { SuccessfulSources } from "@/components/articles/successful-sources"
import { LoadingCardGrid, LoadingSearchSortFilter, LoadingSources } from '@/components/articles/loading-templates'
import { Suspense } from 'react'
import { fetchAllArticles } from '@/app/actions/fetchArticles'
import { redirect } from 'next/navigation';

import { UnifiedSearchParams } from '@/lib/types';
import { formatDate } from '@/lib/utils'
import { RSS_SOURCES } from '@/lib/rss-sources'
import { SearchSortFilter } from '@/components/articles/search-sort-filter';
import { Footer } from '@/components/articles/footer'


// Add new ServerRenderTime component
async function ServerRenderTime() {
  'use cache'
  return (
    <div className="flex flex-col w-full items-center text-center text-neutral-400">
      <p>Server page render: {formatDate(new Date())}</p>
    </div>
  )
}

// Add generateStaticParams export with URL encoded queries
// export async function generateStaticParams() {
//   const categories = Object.keys(RSS_SOURCES);
//   const sortOptions: SortOption[] = ['relevance', 'date'];
//   const durationOptions: FilterDaysOption[] = ['30', '7', '4', '2'];
  
//   return categories.flatMap(category => 
//     sortOptions.flatMap(sort => 
//       durationOptions.map(days => ({
//         category,
//         searchParams: {
//           q: encodeURIComponent(RSS_SOURCES[category].defaultQuery),
//           sort,
//           days,
//         }
//       }))
//     )
//   );
// }

// Update generateMetadata to handle Promise
export async function generateMetadata({ 
  params,
  searchParams 
}: { 
  params: Promise<{ category?: string }>,
  searchParams: Promise<UnifiedSearchParams>
}) {
  const category = (await params).category || 'astronomy'
  const resolvedSearchParams = await searchParams
  
  if (!resolvedSearchParams.q) {
    return {
      redirect: {
        destination: `/${category}?q=` + encodeURIComponent(RSS_SOURCES[category]?.defaultQuery || RSS_SOURCES['astronomy'].defaultQuery),
        permanent: false,
      },
    }
  }
  return {}
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category?: string }>,
  searchParams: Promise<UnifiedSearchParams>
}) {
  const { t } = useTranslation();
  const category = (await params).category || 'astronomy';
  const resolvedSearchParams = await searchParams;
  const locale = resolvedSearchParams.locale || 'en-US';

  // Handle redirect logic
  if (!resolvedSearchParams.q) {
    redirect(`/${category}?q=` + encodeURIComponent(RSS_SOURCES[category]?.defaultQuery || RSS_SOURCES['astronomy'].defaultQuery));
  }

  const { articles, successfulSources, updateTime } = await fetchAllArticles(category);

  return (
    <>
      <Suspense fallback={<LoadingSources locale={locale} />}>
        <SuccessfulSources 
          successfulSources={successfulSources} 
          articles={articles} 
          updateTime={updateTime} 
          params={resolvedSearchParams}
          locale={locale}
        />
      </Suspense>

      <Suspense fallback={<LoadingSearchSortFilter locale={locale} />}>
        <SearchSortFilter locale={locale} />
      </Suspense>

      <Suspense fallback={<LoadingCardGrid locale={locale} />}>
        <ArticlesGrid
          articles={articles}
          updateTime={updateTime}
          params={resolvedSearchParams}
          locale={locale}
        />
      </Suspense>

      <Suspense fallback={<div className="flex flex-col w-full items-center text-center text-neutral-400">
        <p>Search Params: <code className="font-mono bg-neutral-100 dark:bg-neutral-800 animate-pulse">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code></p>
      </div>}>
        <div className="flex flex-col w-full items-center text-center text-neutral-400">
          <p>Search Params: <code className="font-mono">{JSON.stringify(resolvedSearchParams)}</code></p>
        </div>
      </Suspense>
      <ServerRenderTime />
      <Footer />
    </>
  )
}
