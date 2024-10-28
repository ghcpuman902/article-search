import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getDictionary, getDomainNameFromUrl } from "../lib/utils";
import { LastFetched } from "./last-fetched";

export const SuccessfulSources = async ({ locale, successfulSources, updateTime }) => {
    const dict = getDictionary(locale);

    return (
        <div className="my-6">
            <Label className="mr-1">{dict.label.article_sources}</Label>
            {successfulSources ? successfulSources.map((source, index) => {
                const { url, count } = source;
                return (
                    <Badge key={index} variant="outline" className="mx-1">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">{getDomainNameFromUrl(url)} ({count})</a>
                    </Badge>
                );
            }) : dict.label.loading}
            <LastFetched locale={locale} updateTime={updateTime} />
        </div>
    );
}