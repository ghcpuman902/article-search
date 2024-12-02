import React from 'react'
export const experimental_ppr = true

import { ArticlesGrid } from './ui/articles-grid'
import { SuccessfulSources } from "./ui/successful-sources"
import { LoadingCardGrid, LoadingSources } from './ui/loading-templates'
import { Suspense } from 'react'
import { fetchAllArticles } from './actions/fetchArticles'
import { redirect } from 'next/navigation';

import { Article, Source } from '@/lib/types'
import { formatDate } from '@/lib/utils'

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
  return [
    { q: encodeURIComponent('astronomy') },
    { q: encodeURIComponent('attention grabbing astronomy news') }
  ]
}

// Add redirect if q is empty with URL encoded default query
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  if (!params.q) {
    return {
      redirect: {
        destination: '/?q=' + encodeURIComponent('attention grabbing astronomy news'),
        permanent: false,
      },
    }
  }
  return {}
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = 'en'

  const params = await searchParams;

  // Handle redirect logic in the Page component
  if (!params.q) {
    redirect('/?q=' + encodeURIComponent('attention grabbing astronomy news'));
  }

  const { articles, successfulSources, updateTime } = await fetchAllArticles() as { articles: Article[], successfulSources: Source[], updateTime: Date };

  return (
    <>
      <Suspense fallback={<LoadingSources />}>
        <SuccessfulSources locale={locale} successfulSources={successfulSources} updateTime={updateTime} />
      </Suspense>

      <Suspense fallback={<LoadingCardGrid />}>
        <ArticlesGrid
          locale={locale}
          articles={articles}
          updateTime={updateTime}
          params={params}
        />
      </Suspense>

      <div className="flex flex-col w-full items-center text-center text-neutral-400">
        <p>Search Params: {JSON.stringify(params)}</p>
      </div>
      <ServerRenderTime />
    </>
  )
}
