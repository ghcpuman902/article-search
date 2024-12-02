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

export const LoadingCardGrid = async () => {
    const colorData = ["amber|100|600", "sky|100|400", "sky|200|600", "blue|200|600", "emerald|200|600", "violet|200|600", "neutral|200|600"];

    const zoneColors = colorData.map(color => {
        const [baseColor, defaultIntensity, darkModeIntensity] = color.split("|");
        return `bg-${baseColor}-${defaultIntensity} dark:bg-${baseColor}-${darkModeIntensity} hover:bg-${baseColor}-${parseInt(defaultIntensity)} dark:hover:bg-${baseColor}-${parseInt(darkModeIntensity)} active:bg-${baseColor}-${parseInt(defaultIntensity)} dark:active:bg-${baseColor}-${parseInt(darkModeIntensity)}`;
    });

    const zoneBorderColors = colorData.map(color => {
        const [baseColor, defaultIntensity, darkModeIntensity] = color.split("|");
        return `border-${baseColor}-${parseInt(defaultIntensity) + 100} dark:border-${baseColor}-${parseInt(darkModeIntensity) - 100}`;
    });

    const loadingPlaceHolderArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

    return (
        <>
            <div className="items-stretch justify-center mb-6">
                <div className="scroll-m-20 font-semibold tracking-tight text-neutral-400 dark:text-neutral-600">loading articles</div>
            </div>
            <div className="items-stretch justify-center gap-6 rounded-lg grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {loadingPlaceHolderArr.map((key) => {
                    return (<Card key={key} className={`overflow-clip ${zoneBorderColors[6]}`}>
                        <AspectRatio ratio={16 / 9} className="relative overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </AspectRatio>
                        <CardHeader>
                            <CardTitle><Skeleton className="w-5/6 h-[1em]" /></CardTitle>
                            <CardTitle><Skeleton className="w-full h-[1em]" /></CardTitle>
                            <CardTitle><Skeleton className="w-2/6 h-[1em]" /></CardTitle>
                            <div className="text-sm text-muted-foreground pt-1"><Badge variant="secondary" className="mr-1" suppressHydrationWarning>0h ago</Badge><Badge variant="secondary" className={zoneColors[6]}>___ (???%)</Badge></div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[1rem] w-full" />
                            <Skeleton className="h-[1rem] w-full" />
                            <Skeleton className="h-[1rem] w-full" />
                            <Skeleton className="h-[1rem] w-5/6" />
                        </CardContent>
                        <CardFooter>
                            <div className="leading-7 [&:not(:first-child)]:mt-6 text-ellipsis overflow-hidden">Source: <Skeleton className="w-[40px] h-[1em]" /></div>
                        </CardFooter>
                    </Card>
                    );
                })}
            </div>
        </>
    );
}

export const LoadingSources = async () => {
    const dict = getDictionary();
    
    return (
        <div className="my-6">
            <Label className="mr-1">{dict.label.article_sources}</Label>
            {dict.label.loading}
        </div>
    );
}

export const LoadingSearchSortFilter = async () => {
    const dict = getDictionary();

    return (
        <div className="mt-6 w-full flex flex-wrap justify-center">
            <div className="w-full flex">
                <Input id="query" type="text" className="mr-2" value="astronomy scientific research, space exploration, deep sky news" disabled={true} />
                <Button className="flex flex-nowrap whitespace-nowrap" disabled={true}><span className="animate-spin text-xl">☻</span>&nbsp;&nbsp;{dict.button.wait}</Button>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="sort-by-options" className="my-2 mr-3">{dict.label.sort_by}</Label>
                <RadioGroup defaultValue="relevance" id="sort-by-options" className="flex gap-2">
                    <RadioGroupItem value="relevance" id="relevance" checked={true} disabled={true}/>
                    <Label className="mr-1" htmlFor="relevance">{dict.label.relevance}</Label>
                    <RadioGroupItem value="date" id="date" checked={false} disabled={true}/>
                    <Label className="mr-1" htmlFor="date">{dict.label.date}</Label>
                </RadioGroup>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="filter-by-options" className="my-2 mr-3">{dict.label.filter_by}</Label>
                <RadioGroup defaultValue="four-days" id="filter-by-options" className="flex gap-2">
                    <RadioGroupItem value="one-month" id="one-month" checked={false} disabled={true}/>
                    <Label className="mr-1" htmlFor="one-month">{dict.label["one-month"]}</Label>
                    <RadioGroupItem value="one-week" id="one-week" checked={false} disabled={true}/>
                    <Label className="mr-1" htmlFor="one-week">{dict.label["one-week"]}</Label>
                    <RadioGroupItem value="four-days" id="four-days" checked={true} disabled={true}/>
                    <Label className="mr-1" htmlFor="four-days">{dict.label["four-days"]}</Label>
                    <RadioGroupItem value="fourty-eight-hours" id="fourty-eight-hours" checked={false} disabled={true}/>
                    <Label className="mr-1" htmlFor="fourty-eight-hours">{dict.label["fourty-eight-hours"]}</Label>
                </RadioGroup>
            </div>
        </div>
    );
}