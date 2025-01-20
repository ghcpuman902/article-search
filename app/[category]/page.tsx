export const experimental_ppr = true

// import {
//   // unstable_cacheTag as cacheTag,
//   unstable_cacheLife as cacheLife,
//   // revalidateTag,
// } from 'next/cache'

import React from 'react'

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
      <div className="flex flex-col w-full items-center text-center text-neutral-400">
        <p>Server page render: {formatDate(new Date())}</p>
      </div>
      <Footer />

      <div className="hidden">
          {/* Sample colors to help tailwind treeshaking correctly*/}
          <div className="bg-amber-100 dark:bg-amber-600 hover:bg-amber-200 dark:hover:bg-amber-700 active:bg-amber-300 dark:active:bg-amber-700" />
          <div className="bg-sky-100 dark:bg-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500 active:bg-sky-300 dark:active:bg-sky-500" />
          <div className="bg-sky-200 dark:bg-sky-600 hover:bg-sky-300 dark:hover:bg-sky-700 active:bg-sky-400 dark:active:bg-sky-700" />
          <div className="bg-blue-200 dark:bg-blue-600 hover:bg-blue-300 dark:hover:bg-blue-700 active:bg-blue-400 dark:active:bg-blue-700" />
          <div className="bg-emerald-200 dark:bg-emerald-600 hover:bg-emerald-300 dark:hover:bg-emerald-700 active:bg-emerald-400 dark:active:bg-emerald-700" />
          <div className="bg-violet-200 dark:bg-violet-600 hover:bg-violet-300 dark:hover:bg-violet-700 active:bg-violet-400 dark:active:bg-violet-700" />
          <div className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:bg-neutral-400 dark:active:bg-neutral-700" />
          {/* Sample border colors to help tailwind treeshaking correctly*/}
          <div className="border-amber-200 dark:border-amber-500" />
          <div className="border-sky-200 dark:border-sky-300" />
          <div className="border-sky-300 dark:border-sky-500" />
          <div className="border-blue-300 dark:border-blue-500" />
          <div className="border-emerald-300 dark:border-emerald-500" />
          <div className="border-violet-300 dark:border-violet-500" />
          <div className="border-neutral-300 dark:border-neutral-500" />
        </div>
    </>
  )
}
