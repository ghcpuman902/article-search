import React from 'react'

import { ArticlesGrid } from '@/components/articles/articles-grid'
import { SuccessfulSources } from "@/components/articles/successful-sources"
import { fetchAllArticles } from '@/app/actions/fetchArticles'
import { UnifiedSearchParams } from '@/lib/types'
import { SearchSortFilter } from '@/components/articles/search-sort-filter'
import { redirect } from 'next/navigation'
import { RSS_SOURCES } from '@/lib/rss-sources'
import { connection } from 'next/server'

// Async component that fetches and displays articles data
export const ArticlesContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ category?: string }>;
  searchParams: Promise<UnifiedSearchParams>;
}) => {
  // Defer rendering until request is received - enables streaming
  await connection();
  
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedParams.category || 'astronomy';
  const locale = resolvedSearchParams.locale || 'en-US';

  // Handle redirect check
  if (!resolvedSearchParams.q) {
    redirect(`/${category}?q=` + encodeURIComponent(RSS_SOURCES[category]?.defaultQuery || RSS_SOURCES['astronomy'].defaultQuery));
  }

  const { articles, successfulSources, updateTime } = await fetchAllArticles(category);

  return (
    <>
      <SuccessfulSources
        successfulSources={successfulSources}
        articles={articles}
        updateTime={updateTime}
        params={resolvedSearchParams}
        locale={locale}
      />

      <SearchSortFilter locale={locale} />

      <ArticlesGrid
        articles={articles}
        updateTime={updateTime}
        params={resolvedSearchParams}
        locale={locale}
      />
    </>
  );
};
