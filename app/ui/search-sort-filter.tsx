'use client';

import React, { useState, useEffect } from 'react';
import { track } from '@vercel/analytics';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { AlertCircle } from "lucide-react"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {useRef} from 'react';
import { getDictionary } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
    SortOption, 
    FilterDaysOption, 
    DURATION_MAPPING,
    DurationKey 
} from '@/lib/types';


export const SearchSortFilter: React.FC<{ 
    locale?: string; 
}> = ({ locale = 'en-US' }) => {
    const queryInputRef = useRef<HTMLInputElement>(null);
    const dict = getDictionary(locale);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get current URL parameters
    const currentQuery = searchParams.get('q') || '';
    const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';
    const currentDays = (searchParams.get('days') as FilterDaysOption) || '4';

    // Optimistic state for query, sort, and days
    const [optimisticQuery, setOptimisticQuery] = useState(currentQuery);
    const [optimisticSort, setOptimisticSort] = useState(currentSort);
    const [optimisticDays, setOptimisticDays] = useState(currentDays);

    // Rename isSearching to isLoading
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setOptimisticQuery(currentQuery);
        setOptimisticSort(currentSort);
        setOptimisticDays(currentDays);
    }, [currentQuery, currentSort, currentDays]);

    // Update URL helper function
    const updateURL = (params: { [key: string]: string }) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newSearchParams.set(key, value);
        });
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const updateSortingMethod = (value: string) => {
        setOptimisticSort(value as SortOption); // Optimistically update sort
        setIsLoading(true); // Set loading state
        updateURL({ sort: value });
    };

    const updateFilterDays = (value: DurationKey) => {
        setOptimisticDays(DURATION_MAPPING[value]); // Optimistically update days
        setIsLoading(true); // Set loading state
        updateURL({ days: DURATION_MAPPING[value] });
    };

    const handleSearch = () => {
        const queryValue = queryInputRef.current?.value || '';
        setOptimisticQuery(queryValue);
        setIsLoading(true);
        if (track) {
            track('ArticleSearch', { queryString: queryValue });
        }
        updateURL({ q: queryValue });
    };

    // Update useEffect to reset loading state
    useEffect(() => {
        setIsLoading(false);
    }, [searchParams]);

    const rainbowKeyframes = `
    @keyframes rainbow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    `;

    const rainbowStyle = {
        background: 'linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
        backgroundSize: '1400% 1400%',
        animation: 'rainbow 10s ease infinite',
        color: 'white',
        border: 'none'
    };

    // Inject the keyframes into the document head
    if (typeof document !== 'undefined') {
        const styleSheet = document.styleSheets[0] || document.createElement('style');
        if (!styleSheet.cssRules || !Array.from(styleSheet.cssRules).some(rule => rule instanceof CSSKeyframesRule && rule.name === 'rainbow')) {
            styleSheet.insertRule(rainbowKeyframes, styleSheet.cssRules.length);
        }
    }

    return (
        <div className="mt-6 w-full flex flex-wrap justify-center">
            <div className="w-full flex">
                <Input 
                    id="query" 
                    type="text" 
                    className="mr-2" 
                    value={optimisticQuery} 
                    ref={queryInputRef}
                    onChange={(e) => setOptimisticQuery(e.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSearch();
                        }
                    }}
                    style={isLoading ? rainbowStyle : undefined}
                    disabled={isLoading}
                />
                <Button 
                    className={`flex flex-nowrap whitespace-nowrap relative overflow-hidden`}
                    onClick={handleSearch}
                    disabled={isLoading}
                    style={isLoading ? rainbowStyle : undefined}
                >
                    {dict.button.search}
                </Button>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="sort-by-options" className="my-2 mr-3">{dict.label.sort_by}</Label>
                <RadioGroup 
                    value={optimisticSort} 
                    id="sort-by-options" 
                    className="flex gap-2"
                    onValueChange={updateSortingMethod}
                >
                    <RadioGroupItem value="relevance" id="relevance" checked={optimisticSort === "relevance"} />
                    <Label className="mr-1" htmlFor="relevance">{dict.label.relevance}</Label>
                    <RadioGroupItem value="date" id="date" checked={optimisticSort === "date"} />
                    <Label className="mr-1" htmlFor="date">{dict.label.date}</Label>
                </RadioGroup>
            </div>
            <div className="flex items-center mx-2">
                <Label htmlFor="filter-by-options" className="my-2 mr-3">{dict.label.filter_by}</Label>
                <RadioGroup 
                    value={optimisticDays} 
                    id="filter-by-options" 
                    className="flex gap-2"
                    onValueChange={updateFilterDays}
                >
                    {Object.entries(DURATION_MAPPING).map(([key, value]) => (
                        <React.Fragment key={key}>
                            <RadioGroupItem 
                                value={key} 
                                id={key} 
                                checked={optimisticDays === value} 
                            />
                            <Label className="mr-1" htmlFor={key}>
                                {dict.label[key as DurationKey]}
                            </Label>
                        </React.Fragment>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
}

