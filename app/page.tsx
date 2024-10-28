import { SearchSortFilter } from './ui/search-sort-filter'
import { ArticlesGrid } from './ui/articles-grid'
import { SuccessfulSources } from "./ui/succesful-sources"
import { LoadingCardGrid, LoadingSources, LoadingSearchSortFilter } from './ui/loading-templates'
import { Suspense } from 'react'
import { AppContextProvider } from './ui/article-context'
import { fetchAllArticles } from './actions/fetchArticles'

import { Article } from './lib/types'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

export default async function Page({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const locale = 'en'
  
  // Pass searchParams to fetchAllArticles if needed
  const { articles, successfulSources, updateTime } = await fetchAllArticles() as { articles: Article[], successfulSources: any, updateTime: any };

  // Convert searchParams to a format that can be passed to client components
  const searchParamsString = JSON.stringify(await searchParams)

  return (
    <>
      {/* <Suspense fallback={<><LoadingSources /><LoadingSearchSortFilter /><LoadingCardGrid /></>}> */}
        {/* <AppContextProvider> */}
          {/* <SuccessfulSources locale={locale} successfulSources={successfulSources} updateTime={updateTime} />
          <SearchSortFilter locale={locale} initialSearchParams={searchParamsString} /> */}
          {/* <ArticlesGrid locale={locale} articles={articles} updateTime={updateTime} searchParams={searchParamsString} /> */}
          <ArticlesGrid 
          locale={locale} 
          initialArticles={articles} 
          updateTime={updateTime} 
          initialSearchParams={searchParamsString}
        />
        {/* </AppContextProvider> */}
      {/* </Suspense> */}
      <div className="flex flex-col w-full items-center text-center text-neutral-400">
        <p>Search Params: {searchParamsString}</p>
        <p>Server page render: {new Date().toISOString()}</p>
      </div>
    </>
  )
}
