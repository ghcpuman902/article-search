import React from 'react';

import { Badge } from "@/components/ui/badge";
import { Dictionary, getDictionary, getDomainNameFromUrl, linkToKey } from "@/lib/utils";
import { LastFetched } from "./last-fetched";
import { FilterDaysOption, SuccessfulSource, UnifiedSearchParams, Article } from "@/lib/types";

interface SuccessfulSourcesProps {
    successfulSources: SuccessfulSource[];
    articles: Article[];
    updateTime: Date;
    params: UnifiedSearchParams;
    locale: string;
}

export function SuccessfulSources({
    successfulSources,
    articles: initialArticles,
    updateTime,
    params,
    locale = 'en-US'
}: SuccessfulSourcesProps) {
    const dict = getDictionary(locale);
    const filterByDays = getFilterDays(params.days);

    const visibleArticles = processArticles(initialArticles, filterByDays);
    const visibleCountBySource = calculateVisibleCounts(visibleArticles);

    return (
        <section
            className="my-6 flex flex-wrap gap-2 mt-2"
            aria-labelledby="sources-heading"
        >
            <div className="flex flex-wrap items-center gap-1">
                <span
                    id="sources-heading"
                    className="mr-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {dict.label.article_sources}
                </span>
                {renderSourceBadges(successfulSources, visibleCountBySource, dict)}
                <LastFetched locale={locale} updateTime={updateTime} />
            </div>
        </section>
    );
}

// Helper functions
function getFilterDays(days: FilterDaysOption | undefined): number {
    if (!days) return 4;
    const parsed = parseInt(days);
    return Number.isNaN(parsed) ? 4 : parsed;
}

function processArticles(articles: Article[], filterByDays: number) {
    const currentTime = Date.now();
    const daysInMs = filterByDays * 24 * 60 * 60 * 1000;

    return articles
        .filter((article, index, self) =>
            index === self.findIndex(a => linkToKey(a.link) === linkToKey(article.link))
        )
        .map(article => ({
            ...article,
            hidden: (currentTime - getArticleTimestamp(article.pubDate)) > daysInMs
        }));
}

function getArticleTimestamp(pubDate: string | Date | number): number {
    if (typeof pubDate === 'string') return new Date(pubDate).getTime();
    if (pubDate instanceof Date) return pubDate.getTime();
    return pubDate;
}

function calculateVisibleCounts(articles: Article[]): Record<string, number> {
    return articles.reduce((acc, article) => {
        const domainName = getDomainNameFromUrl(article.source);
        acc[domainName] = (acc[domainName] || 0) + (article.hidden ? 0 : 1);
        return acc;
    }, {} as Record<string, number>);
}

function renderSourceBadges(
    sources: SuccessfulSource[] | null,
    visibleCounts: Record<string, number>,
    dict: Dictionary
) {
    if (!sources) return <span aria-label={dict.label.loading}>{dict.label.loading}</span>;

    return sources.map((source, index) => {
        const { url, total, maxAge } = source;
        const domainName = getDomainNameFromUrl(url);
        const visibleCount = visibleCounts[domainName] || 0;
        const badgeLabel = `${domainName}: ${visibleCount} of ${total - maxAge} articles`;

        return (
            <Badge
                key={index}
                variant="outline"
                className="hover:bg-accent px-1.5"
            >
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    aria-label={badgeLabel}
                >
                    {domainName} ({visibleCount}/{total - maxAge})
                </a>
            </Badge>
        );
    });
}