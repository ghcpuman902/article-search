import React, { Suspense } from 'react'
import { fetchAllArticles } from '@/app/actions/fetchArticles'
import { redirect } from 'next/navigation';
import { UnifiedSearchParams } from '@/lib/types';
import { RSS_SOURCES } from '@/lib/rss-sources';
import { LoadingSources, LoadingArticleTable } from '@/components/articles/loading-templates';
import ArticleTable from '@/components/articles/article-table';
import { SuccessfulSources } from '@/components/articles/successful-sources';
import { Footer } from '@/components/articles/footer';

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
            <Suspense fallback={<><LoadingSources /><LoadingArticleTable /></>}>
                <SuccessfulSources
                    successfulSources={successfulSources}
                    articles={articles}
                    updateTime={updateTime}
                    params={resolvedSearchParams}
                    locale={locale}
                />
                <ArticleTable articles={articles} locale={locale} />
            </Suspense>
            <Footer />  
        </>
    )
}


// export default async function ListPage() {
//     return (
//         <>
//             <div className="text-center text-foreground">ListPage</div>
//         </>
//     )
// }
