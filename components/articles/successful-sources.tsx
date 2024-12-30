import React from 'react';

import { Label } from "@/components/ui/label";
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
  locale='en-US'
}: SuccessfulSourcesProps) {
    const dict = getDictionary(locale);
    const filterByDays = getFilterDays(params.days);

    const visibleArticles = processArticles(initialArticles, filterByDays);
    const visibleCountBySource = calculateVisibleCounts(visibleArticles);

    return (
        <div className="my-6">
            <Label className="mr-1">{dict.label.article_sources}</Label>
            {renderSourceBadges(successfulSources, visibleCountBySource, dict)}
            <LastFetched locale={locale} updateTime={updateTime} />
        </div>
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
    if (!sources) return dict.label.loading;

    return sources.map((source, index) => {
        const { url, total, maxAge } = source;
        const domainName = getDomainNameFromUrl(url);
        const visibleCount = visibleCounts[domainName] || 0;

        return (
            <Badge key={index} variant="outline" className="mx-1">
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {domainName} ({visibleCount}/{total-maxAge})
                </a>
            </Badge>
        );
    });
}