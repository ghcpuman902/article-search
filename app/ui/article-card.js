import Link from 'next/link';
// import Image from "next/image"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArticleMedia } from './article-media'
import { Suspense } from 'react';

// import { useSearchParams } from 'next/navigation';

import { timeAgo, getDictionary, getDomainNameFromUrl } from "../lib/utils";

export const ArticleCard = ({ locale, article }) => {
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

    function mapValue(d) {
        if (d == null) { return { newDistance: -5, zone: 6 } }

        const mu = 0.785;
        const sigma = 0.0306;

        // Calculate the difference from the mean in terms of sigma
        const diffSigma = (d - mu) / sigma;

        // Based on the difference, determine the zone and position within the zone
        let zone = Math.floor(diffSigma + 2); // +1 to shift zones from -1, 0, 1, 2... to 0, 1, 2, 3...
        const positionInZone = diffSigma - zone + 1;
        const newDistance = zone + positionInZone;

        if (zone < 0) { zone = 0; }
        if (zone > 5) { zone = 5; }

        // Return the sum of the zone and the position within the zone
        return { newDistance, zone };
    }

    function dToPercentage(d) {
        if (d >= 5) { return `100%`; }
        if (d <= -5) { return `???%`; }
        const percentage = Math.floor(d / 5 * 10000) / 100;
        return `${percentage}%`;
    }


    return (
        <>
            {article ? (<Card className={`overflow-clip ${zoneBorderColors[mapValue(article.distance).zone]}`}>
                        <ArticleMedia description={article.image} placeHolder={getDomainNameFromUrl(article.source)}/>
                <CardHeader>
                    <CardTitle><a href={article.link} target="_blank" rel="noopener noreferrer" className={`underline ${locale=='jp'?'leading-relaxed':''}`}>{article.title}</a></CardTitle>
                    <div className="text-sm text-muted-foreground pt-1"><Badge variant="secondary" className="mr-1" suppressHydrationWarning>{timeAgo(article.pubDate, locale)}</Badge><Badge variant="secondary" className={zoneColors[mapValue(article.distance).zone]}>{zoneBadgeNames[mapValue(article.distance).zone]} ({dToPercentage(mapValue(article.distance).newDistance)})</Badge></div>
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