import React from 'react'
export const experimental_ppr = true

import { ArticlesGrid } from '../ui/articles-grid'
import { SuccessfulSources } from "../ui/successful-sources"
import { LoadingCardGrid, LoadingSearchSortFilter, LoadingSources } from '../ui/loading-templates'
import { Suspense } from 'react'
import { fetchAllArticles } from '../actions/fetchArticles'
import { redirect } from 'next/navigation';

import { UnifiedSearchParams } from '@/lib/types';
import { formatDate } from '@/lib/utils'
import { RSS_SOURCES } from '@/lib/rss-sources'
import { SearchSortFilter } from '../ui/search-sort-filter';


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
export async function generateStaticParams() {
  return Object.keys(RSS_SOURCES).flatMap(category => [
    { 
      category,
      q: encodeURIComponent(RSS_SOURCES[category].defaultQuery)
    }
  ])
}

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
      <Suspense fallback={<LoadingSources />}>
        <SuccessfulSources 
          successfulSources={successfulSources} 
          articles={articles} 
          updateTime={updateTime} 
          params={resolvedSearchParams}
          locale={locale}
        />
      </Suspense>

      <Suspense fallback={<LoadingSearchSortFilter />}>
        <SearchSortFilter locale={locale} />
      </Suspense>

      <Suspense fallback={<LoadingCardGrid />}>
        <ArticlesGrid
          articles={articles}
          updateTime={updateTime}
          params={resolvedSearchParams}
          locale={locale}
        />
      </Suspense>

      <div className="flex flex-col w-full items-center text-center text-neutral-400">
        <p>Search Params: <code className="font-mono">{JSON.stringify(resolvedSearchParams)}</code></p>
      </div>
      <ServerRenderTime />
    </>
  )
}
