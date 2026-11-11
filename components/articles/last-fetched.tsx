'use client'
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { timeAgo, getDictionary } from "@/lib/utils";

interface LastFetchedProps {
    locale: string;
    updateTime: Date;
}

export function LastFetched({ locale, updateTime }: LastFetchedProps) {
    const dict = getDictionary(locale);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    
    const timeAgoString = timeAgo(updateTime, locale, now);
    
    return (
        <Label className="text-neutral-400 dark:text-neutral-600" suppressHydrationWarning>
            {dict.label.last_fetched.replace("[TIME AGO]", timeAgoString)}
        </Label>
    );
} 