'use client'

import React, { memo, useMemo } from 'react'
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleMedia } from './article-media'
import { timeAgo, getDictionary, getDomainNameFromUrl, linkToKey, cn } from "@/lib/utils";

// Move color data outside component
const COLOR_DATA = [
    { base: 'amber', light: '100', dark: '600' },
    { base: 'sky', light: '100', dark: '400' },
    { base: 'sky', light: '200', dark: '600' },
    { base: 'blue', light: '200', dark: '600' },
    { base: 'emerald', light: '200', dark: '600' },
    { base: 'violet', light: '200', dark: '600' },
    { base: 'neutral', light: '200', dark: '600' }
] as const;

// Precompute color classes
const ZONE_COLORS = COLOR_DATA.map(({ base, light, dark }) => 
    `bg-${base}-${light} dark:bg-${base}-${dark} hover:bg-${base}-${light} dark:hover:bg-${base}-${dark} active:bg-${base}-${light} dark:active:bg-${base}-${dark}`
);

const ZONE_BORDER_COLORS = COLOR_DATA.map(({ base, light, dark }) => 
    `border-${base}-${parseInt(light) + 100} dark:border-${base}-${parseInt(dark) - 100}`
);

// Move calculation functions outside
const calculateP = (d: number | null | undefined): number => {
    if (d == null) return 0;
    const k = -15.715; // Steepness of the sigmoid
    const d0 = 0.607;  // Midpoint of the sigmoid
    return ((Math.exp(k * (d - d0)) / (1 + Math.exp(k * (d - d0)))) * 1.07 - 0.07) * 100;
};

const mapValue = (d: number | null | undefined) => {
    if (d == null) return { newDistance: -5, zone: 6 };
    const percentage = Math.max(0, Math.min(100, calculateP(d)));
    const zone = Math.min(5, Math.floor(percentage / 20));
    return { newDistance: percentage, zone };
};

const dToPercentage = (d: number | null | undefined): string => {
    if (d == null) return '???%';
    const percentage = Math.min(100, calculateP(d));
    return `${percentage.toFixed(1)}%`;
};

interface Article {
    title: string;
    link: string;
    pubDate: number;
    description: string;
    image: string;
    source: string;
    hidden: boolean;
    distance?: number;
    key?: string;
}

interface ArticleCardProps {
    locale: string;
    article: Article;
}

export const ArticleCard = memo(function ArticleCard({ article, locale }: ArticleCardProps) {
    // Move hooks before any conditional returns
    const timeAgoDate = useMemo(
        () => timeAgo(new Date(article?.pubDate || 0), locale), 
        [article?.pubDate, locale]
    );

    const dict = getDictionary(locale);
    const zoneBadgeNames = dict["zoneBadgeNames"];

    const { zone } = useMemo(
        () => mapValue(article?.distance),
        [article?.distance]
    );

    const percentage = useMemo(
        () => dToPercentage(article?.distance),
        [article?.distance]
    );

    const domainName = useMemo(
        () => {
            try {
                return article?.source ? getDomainNameFromUrl(article.source) : 'Unknown Source';
            } catch {
                // Remove unused 'e' parameter
                return 'Unknown Source';
            }
        },
        [article?.source]
    );

    // Move the null check after all hooks
    if (!article) return null;

    return (
        <Card 
            key={linkToKey(article.link)} 
            className={cn("overflow-clip", ZONE_BORDER_COLORS[zone])}
        >
            <ArticleMedia 
                description={article.image} 
                placeHolder={domainName} 
            />
            <CardHeader>
                <CardTitle>
                    <a 
                        href={article.link || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <h3 className={cn(
                            "scroll-m-20 text-2xl font-semibold tracking-tight leading-none underline",
                            { "leading-relaxed": ['ja-JP', 'zh-CN', 'zh-TW'].includes(locale) }
                        )}>
                            {article.title || 'Untitled'}
                        </h3>
                    </a>
                </CardTitle>
                <div className="text-sm text-muted-foreground pt-1">
                    <Badge variant="secondary" className="mr-1" suppressHydrationWarning>
                        {timeAgoDate}
                    </Badge>
                    <Badge 
                        variant="secondary" 
                        className={ZONE_COLORS[zone]}
                    >
                        {zoneBadgeNames[zone]} ({percentage})
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div dangerouslySetInnerHTML={{ __html: article.description || '' }} />
            </CardContent>
            <CardFooter>
                <div className="leading-7 [&:not(:first-child)]:mt-6 text-ellipsis overflow-hidden">
                    Source: <Link 
                        href={article.source || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                    >
                        {domainName}
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}, (prevProps, nextProps) => prevProps.article.key === nextProps.article.key);