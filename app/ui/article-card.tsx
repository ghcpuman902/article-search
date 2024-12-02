import React from 'react'

import Link from 'next/link';

import {
    Card,
    CardContent,
    // CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArticleMedia } from './article-media'

import { timeAgo, getDictionary, getDomainNameFromUrl } from "@/lib/utils";
import { Article } from '@/lib/types';

interface ArticleCardProps {
    locale: string;
    article: Article;
}

export function ArticleCard({ locale, article }: ArticleCardProps) {
    const dict = getDictionary(locale);
    const colorData = ["amber|100|600", "sky|100|400", "sky|200|600", "blue|200|600", "emerald|200|600", "violet|200|600", "neutral|200|600"];

    const zoneColors = colorData.map(color => {
        const [baseColor, defaultIntensity, darkModeIntensity] = color.split("|");
        return `bg-${baseColor}-${defaultIntensity} dark:bg-${baseColor}-${darkModeIntensity} hover:bg-${baseColor}-${parseInt(defaultIntensity)} dark:hover:bg-${baseColor}-${parseInt(darkModeIntensity)} active:bg-${baseColor}-${parseInt(defaultIntensity)} dark:active:bg-${baseColor}-${parseInt(darkModeIntensity)}`;
    });

    const zoneBorderColors = colorData.map(color => {
        const [baseColor, defaultIntensity, darkModeIntensity] = color.split("|");
        return `border-${baseColor}-${parseInt(defaultIntensity) + 100} dark:border-${baseColor}-${parseInt(darkModeIntensity) - 100}`;
    });

    const zoneBadgeNames = dict["zoneBadgeNames"];

    function mapValue(d: number | null) {
        if (d == null) { return { newDistance: -5, zone: 6 } }
        
        // Calculate zone based on clipped percentage
        const percentage = Math.max(0, Math.min(100, calculateP(d)));
        let zone = Math.floor(percentage / 20); // Split 0-100 into 5 zones
        
        if (zone > 5) { zone = 5; } // Safeguard for 100% case

        return { newDistance: percentage, zone };
    }

    function dToPercentage(d: number | null) {
        if (d == null) { return `???%`; }
        const percentage = Math.min(100, calculateP(d));
        return `${percentage.toFixed(1)}%`;
    }

    // function calculateP(d: number | null) {
    //     if (d == null) { return 0; }
    //     const k = -23.515; // Steepness of the sigmoid
    //     const d0 = 0.707;  // Midpoint of the sigmoid
    //     return ((Math.exp(k * (d - d0)) / (1 + Math.exp(k * (d - d0)))) * 0.87 - 0.07) * 100;
    // }

    function calculateP(d: number | null) {
        if (d == null) { return 0; }
        const k = -15.715; // Steepness of the sigmoid
        const d0 = 0.607;  // Midpoint of the sigmoid
        return ((Math.exp(k * (d - d0)) / (1 + Math.exp(k * (d - d0)))) * 1.07 - 0.07) * 100;
    }

    return (
        <>
            {article ? (<Card className={`overflow-clip ${zoneBorderColors[mapValue(article.distance).zone]}`}>
                <ArticleMedia description={article.image} placeHolder={getDomainNameFromUrl(article.source)} />
                <CardHeader>
                    <CardTitle><a href={article.link} target="_blank" rel="noopener noreferrer" className={`underline ${locale == 'jp' ? 'leading-relaxed' : ''}`}>{article.title}</a></CardTitle>
                    <div className="text-sm text-muted-foreground pt-1"><Badge variant="secondary" className="mr-1" suppressHydrationWarning>{timeAgo(new Date(article.pubDate), locale)}</Badge><Badge variant="secondary" className={zoneColors[mapValue(article.distance).zone]}>{zoneBadgeNames[mapValue(article.distance).zone]} ({dToPercentage(article.distance)})</Badge></div>
                </CardHeader>
                <CardContent>
                    {/* <Suspense fallback={<AspectRatio ratio={16 / 9}>
                        <Skeleton className="w-full h-full" />
                    </AspectRatio>}> */}
                    <div dangerouslySetInnerHTML={{ __html: article.description }}></div>
                    {/* </Suspense> */}
                </CardContent>
                <CardFooter>
                    <div className="leading-7 [&:not(:first-child)]:mt-6 text-ellipsis overflow-hidden">Source: <Link href={article.source} target="_blank" rel="noopener noreferrer" className="hover:underline">{getDomainNameFromUrl(article.source)}</Link></div>
                </CardFooter>
            </Card>) : null}
        </>
    );
}