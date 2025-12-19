import React, { Suspense } from 'react'

import { LoadingCardGrid, LoadingSearchSortFilter, LoadingSources } from '@/components/articles/loading-templates'
import { UnifiedSearchParams } from '@/lib/types';
import { Footer } from '@/components/articles/footer'
import { ArticlesContent } from './articles-content'
import { ServerRenderTime } from '@/components/articles/server-render-time'

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category?: string }>,
  searchParams: Promise<UnifiedSearchParams>
}) {
  return (
    <main role="main">
      <Suspense 
        fallback={
          <>
            <LoadingSources />
            <LoadingSearchSortFilter />
            <LoadingCardGrid />
          </>
        }
      >
        <ArticlesContent
          params={params}
          searchParams={searchParams}
        />
      </Suspense>

      <footer className="flex flex-col w-full items-center text-center text-neutral-400">
        <ServerRenderTime />
        <Footer />
      </footer>

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
    </main>
  )
}
