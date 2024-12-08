'use client';

import React from 'react';
import { track } from '@vercel/analytics';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { AlertCircle } from "lucide-react"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {useEffect, useRef} from 'react';
import { getDictionary } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';


export const SearchSortFilter: React.FC<{ 
    locale?: string; 
}> = ({ locale }) => {
    const queryInputRef = useRef<HTMLInputElement>(null);
    const dict = getDictionary(locale || 'en');
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get current URL parameters
    const currentQuery = searchParams.get('q') || '';
    const currentSort = searchParams.get('sort') || 'relevance';
    const currentDays = searchParams.get('days') || '4';

    // Update URL helper function
    const updateURL = (params: { [key: string]: string }) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newSearchParams.set(key, value);
        });
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const updateSortingMethod = (value: string) => {
        updateURL({ sort: value });
    };

    const updateFilterDays = (value: string) => {
        const durations: { [key: string]: string } = {
            'one-month': '30',
            'one-week': '7',
            'four-days': '4',
            'fourty-eight-hours': '2'
        };
        updateURL({ days: durations[value] || '4' });
    };

    useEffect(() => {
        if (queryInputRef.current) {
            queryInputRef.current.value = currentQuery;
        }
    }, [currentQuery]);

    const handleSearch = () => {
        const queryValue = queryInputRef.current?.value || '';
        if (track) {
            track('ArticleSearch', { queryString: queryValue });
        }
        updateURL({ q: queryValue });
    };

    return (
        <div className="mt-6 w-full flex flex-wrap justify-center">
            <div className="w-full flex">
                <Input 
                    id="query" 
                    type="text" 
                    className="mr-2" 
                    defaultValue={currentQuery} 
                    ref={queryInputRef}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSearch();
                        }
                    }}
                />
                <Button 
                    className="flex flex-nowrap whitespace-nowrap" 
                    onClick={handleSearch}
                >
                    {dict.button.search}
                </Button>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="sort-by-options" className="my-2 mr-3">{dict.label.sort_by}</Label>
                <RadioGroup 
                    defaultValue={currentSort} 
                    id="sort-by-options" 
                    className="flex gap-2"
                    onValueChange={updateSortingMethod}
                >
                    <RadioGroupItem value="relevance" id="relevance" checked={currentSort === "relevance"} />
                    <Label className="mr-1" htmlFor="relevance">{dict.label.relevance}</Label>
                    <RadioGroupItem value="date" id="date" checked={currentSort === "date"} />
                    <Label className="mr-1" htmlFor="date">{dict.label.date}</Label>
                </RadioGroup>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="filter-by-options" className="my-2 mr-3">{dict.label.filter_by}</Label>
                <RadioGroup defaultValue="four-days" id="filter-by-options" className="flex gap-2"
                    onValueChange={updateFilterDays}>
                    <RadioGroupItem value="one-month" id="one-month" checked={currentDays === "30"} />
                    <Label className="mr-1" htmlFor="one-month">{dict.label["one-month"]}</Label>
                    <RadioGroupItem value="one-week" id="one-week" checked={currentDays === "7"} />
                    <Label className="mr-1" htmlFor="one-week">{dict.label["one-week"]}</Label>
                    <RadioGroupItem value="four-days" id="four-days" checked={currentDays === "4"} />
                    <Label className="mr-1" htmlFor="four-days">{dict.label["four-days"]}</Label>
                    <RadioGroupItem value="fourty-eight-hours" id="fourty-eight-hours" checked={currentDays === "2"} />
                    <Label className="mr-1" htmlFor="fourty-eight-hours">{dict.label["fourty-eight-hours"]}</Label>
                </RadioGroup>
            </div>
        </div>
    );
}

