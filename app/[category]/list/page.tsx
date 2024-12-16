import React, { Suspense } from 'react'
import { fetchAllArticles } from '@/app/actions/fetchArticles'
import { redirect } from 'next/navigation';
import { UnifiedSearchParams } from '@/lib/types';
import { RSS_SOURCES } from '@/lib/rss-sources';
import { LoadingSources, LoadingCardGrid } from '@/app/ui/loading-templates';
import ArticleTable from '@/app/ui/article-table';
import { SuccessfulSources } from '@/app/ui/successful-sources';
import { Footer } from '@/app/ui/footer';

export default async function ListPage({
    params,
    searchParams,
}: {
    params: Promise<{ category?: string }>,
    searchParams: Promise<UnifiedSearchParams>
}) {
    const category = (await params).category || 'astronomy';
    const resolvedSearchParams = await searchParams;
    const locale = resolvedSearchParams.locale || 'en-US'; // Default to 'en-US' if not provided

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
            <Suspense fallback={<LoadingCardGrid />}>
                <ArticleTable articles={articles} locale={locale} />
            </Suspense>

            <div className="flex flex-col w-full items-center text-center text-neutral-400">
                <p>Search Params: <code className="font-mono">{JSON.stringify(resolvedSearchParams)}</code></p>
            </div>
            <Footer />  
        </>
    )
}
