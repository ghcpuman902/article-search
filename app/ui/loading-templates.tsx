import React from 'react'

import {
    Card,
    CardContent,
    // CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getDictionary } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { DURATION_MAPPING } from '@/lib/types';

export const LoadingCardGrid: React.FC<{ locale?: string }> = ({ locale }) => {
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

    const loadingPlaceHolderArr = Array(12).fill(null);

    return (
        <>
            <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
                <span className="scroll-m-20 text-center tracking-tight py-1 px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70">
                    <Skeleton className="h-[1em] w-[300px]" />
                </span>
            </div>

            <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {loadingPlaceHolderArr.map((_, index) => (
                    <Card key={index} className={`overflow-clip ${zoneBorderColors[6]}`}>
                        <AspectRatio ratio={16 / 9} className="relative overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </AspectRatio>
                        <CardHeader>
                            <CardTitle>
                                <div className="scroll-m-20 text-2xl font-semibold tracking-tight leading-none">
                                    <Skeleton className="w-5/6 h-[1em] mb-2" />
                                    <Skeleton className="w-full h-[1em] mb-2" />
                                    <Skeleton className="w-2/6 h-[1em]" />
                                </div>
                            </CardTitle>
                            <div className="text-sm text-muted-foreground pt-1">
                                <Badge variant="secondary" className="mr-1">
                                    <Skeleton className="w-[40px] h-[1em]" />
                                </Badge>
                                <Badge variant="secondary" className={zoneColors[6]}>
                                    <Skeleton className="w-[80px] h-[1em]" />
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-[1rem] w-full" />
                                <Skeleton className="h-[1rem] w-full" />
                                <Skeleton className="h-[1rem] w-full" />
                                <Skeleton className="h-[1rem] w-5/6" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="leading-7 [&:not(:first-child)]:mt-6 text-ellipsis overflow-hidden">
                                {dict.table.source}: <Skeleton className="inline-block w-[100px] h-[1em]" />
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}

export const LoadingSources: React.FC<{ locale?: string }> = ({ locale }) => {
    const dict = getDictionary(locale);
    
    return (
        <div className="my-6">
            <Label className="mr-1">{dict.label.article_sources}</Label>
            <div className="inline-flex gap-2">
                {Array(6).fill(null).map((_, i) => (
                    <Badge key={i} variant="outline" className="mx-1">
                        <Skeleton className="w-[100px] h-[1em]" />
                    </Badge>
                ))}
            </div>
        </div>
    );
}

export const LoadingSearchSortFilter: React.FC<{ locale?: string }> = ({ locale }) => {
    const dict = getDictionary(locale);

    return (
        <div className="mt-6 w-full flex flex-wrap justify-center">
            <div className="w-full flex">
                <Input 
                    type="text" 
                    className="mr-2" 
                    disabled={true} 
                    placeholder={dict.label.search_input}
                />
                <Button className="flex flex-nowrap whitespace-nowrap" disabled={true}>
                    {dict.button.search}
                </Button>
            </div>
            <div className="flex items-center mx-2">
                <Label className="my-2 mr-3">{dict.label.sort_by}</Label>
                <RadioGroup defaultValue="relevance" className="flex gap-2">
                    <div className="flex items-center">
                        <RadioGroupItem value="relevance" disabled={true} />
                        <Label className="mr-1">{dict.label.relevance}</Label>
                    </div>
                    <div className="flex items-center">
                        <RadioGroupItem value="date" disabled={true} />
                        <Label className="mr-1">{dict.label.date}</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="flex items-center mx-2">
                <Label className="my-2 mr-3">{dict.label.filter_by}</Label>
                <RadioGroup defaultValue="four-days" className="flex gap-2">
                    {Object.entries(DURATION_MAPPING).map(([key,]) => (
                        <div key={key} className="flex items-center">
                            <RadioGroupItem value={key} disabled={true} />
                            <Label className="mr-1">{dict.label[key]}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
}