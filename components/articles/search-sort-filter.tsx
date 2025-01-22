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
import { setCategoryState } from '@/lib/local-storage';


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

    // Update URL helper function with proper history management
    const updateURL = (params: { [key: string]: string }) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newSearchParams.set(key, value);
        });
        
        // Get category from pathname (e.g., /tech?q=ai -> tech)
        const category = pathname.split('/')[1];
        
        // Store state in localStorage
        if (category) {
            setCategoryState(category, Object.fromEntries(newSearchParams.entries()));
        }
        
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: true });
    };

    const updateSortingMethod = (value: string) => {
        setOptimisticSort(value as SortOption);
        setIsLoading(true);
        updateURL({ 
            sort: value,
            page: '1'  // Reset to page 1 on sort change
        });
    };

    const updateFilterDays = (value: DurationKey) => {
        setOptimisticDays(DURATION_MAPPING[value]);
        setIsLoading(true);
        updateURL({ 
            days: DURATION_MAPPING[value],
            page: '1'  // Reset to page 1 on filter change
        });
    };

    const handleSearch = () => {
        const queryValue = queryInputRef.current?.value || '';
        setOptimisticQuery(queryValue);
        setIsLoading(true);
        if (track) {
            track('ArticleSearch', { queryString: queryValue });
        }
        updateURL({ 
            q: queryValue,
            page: '1'  // Reset to page 1 on new search
        });
    };

    // Update useEffect to reset loading state
    useEffect(() => {
        setIsLoading(false);
    }, [searchParams]);

    const grayWaveKeyframes = `
        @keyframes grayWave {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }`;

    const rainbowBorderKeyframes = `
        @keyframes rainbowBorder {
            0% { border-color: #ff0000; }
            16.67% { border-color: #ff7f00; }
            33.33% { border-color: #ffff00; }
            50% { border-color: #00ff00; }
            66.67% { border-color: #0000ff; }
            83.33% { border-color: #4b0082; }
            100% { border-color: #ff0000; }
        }`;

    // Inject the keyframes into the document head
    if (typeof document !== 'undefined') {
        const styleSheet = document.styleSheets[0] || document.createElement('style');
        if (!styleSheet.cssRules || !Array.from(styleSheet.cssRules).some(rule => 
            rule instanceof CSSKeyframesRule && rule.name === 'grayWave')) {
            styleSheet.insertRule(grayWaveKeyframes, styleSheet.cssRules.length);
        }
        if (!styleSheet.cssRules || !Array.from(styleSheet.cssRules).some(rule => 
            rule instanceof CSSKeyframesRule && rule.name === 'rainbowBorder')) {
            styleSheet.insertRule(rainbowBorderKeyframes, styleSheet.cssRules.length);
        }
    }

    const loadingStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        animation: 'rainbowBorder 2s infinite linear'
    };

    return (
        <div className="mt-6 w-full flex flex-wrap justify-center">
            <div className="w-full flex">
                <Label htmlFor="query" className="sr-only">
                    {dict.label.search_input}
                </Label>
                <Input 
                    id="query" 
                    type="text" 
                    className={`mr-2 ${isLoading ? 'animate-pulse bg-gray-100 dark:bg-gray-700' : ''}`}
                    value={optimisticQuery} 
                    ref={queryInputRef}
                    onChange={(e) => setOptimisticQuery(e.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSearch();
                        }
                    }}
                    style={isLoading ? loadingStyle : undefined}
                    disabled={isLoading}
                />
                <Button 
                    className={`flex flex-nowrap whitespace-nowrap relative overflow-hidden ${isLoading ? 'animate-pulse bg-gray-600 dark:bg-gray-200' : ''}`}
                    onClick={handleSearch}
                    disabled={isLoading}
                    style={isLoading ? loadingStyle : undefined}
                    aria-label={dict.button.search}
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
                    aria-label={dict.label.sort_by}
                >
                    <RadioGroupItem 
                        value="relevance" 
                        id="relevance" 
                        checked={optimisticSort === "relevance"}
                        aria-label={dict.label.relevance}
                    />
                    <Label className="mr-1" htmlFor="relevance">{dict.label.relevance}</Label>
                    <RadioGroupItem 
                        value="date" 
                        id="date" 
                        checked={optimisticSort === "date"}
                        aria-label={dict.label.date}
                    />
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
                    aria-label={dict.label.filter_by}
                >
                    {Object.entries(DURATION_MAPPING).map(([key, value]) => (
                        <React.Fragment key={key}>
                            <RadioGroupItem 
                                value={key} 
                                id={key} 
                                checked={optimisticDays === value}
                                aria-label={dict.label[key as DurationKey]}
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

