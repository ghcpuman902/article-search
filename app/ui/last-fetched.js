'use client'
import { Label } from "@/components/ui/label";
import { timeAgo, olderThan1hr, getDictionary } from "../lib/utils";

export const LastFetched = ({ locale, updateTime }) => {
    const dict = getDictionary(locale);
    
    return (
        <Label className="text-neutral-400 dark:text-neutral-600" suppressHydrationWarning>{dict.label.last_fetched.replace("[TIME AGO]", timeAgo(updateTime, locale))} {olderThan1hr(updateTime) ? dict.label.please_refresh : null}</Label>
    );
}
