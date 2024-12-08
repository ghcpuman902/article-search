import React from 'react';

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getDictionary, getDomainNameFromUrl } from "@/lib/utils";
import { LastFetched } from "./last-fetched";
import { SuccessfulSourcesProps } from "@/lib/types";

export function SuccessfulSources({ 
  category, 
  successfulSources, 
  articles,
  updateTime 
}: SuccessfulSourcesProps) {
    // Determine locale based on category
    const locale = category === 'astronomy-jp' ? 'ja-JP' : 'en-US'
    const dict = getDictionary(locale);

    // Calculate visible articles per source, with null check
    const visibleCountBySource = articles?.reduce((acc, article) => {
        if (!article.hidden) {
            acc[article.source] = (acc[article.source] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>) || {};

    return (
        <div className="my-6">
            <Label className="mr-1">{dict.label.article_sources}</Label>
            {successfulSources ? successfulSources.map((source, index) => {
                const { url, count } = source;
                const visibleCount = visibleCountBySource[url] || 0;
                return (
                    <Badge key={index} variant="outline" className="mx-1">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {getDomainNameFromUrl(url)} ({visibleCount}/{count})
                        </a>
                    </Badge>
                );
            }) : dict.label.loading}
            <LastFetched locale={locale} updateTime={updateTime} />
        </div>
    );
} 