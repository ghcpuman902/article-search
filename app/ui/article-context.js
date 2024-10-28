'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const LoadingContext = createContext(undefined);
const QueryStringContext = createContext(undefined);
const SortingMethodContext = createContext(undefined);
const FilterByDaysContext = createContext(undefined);

export function AppContextProvider({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    );
    let defaultQueryString = 'astronomy scientific research, space exploration, deep sky news';
    if (pathname.endsWith('/article-search/jp')) {
        defaultQueryString = '天文学の研究、宇宙探査、深宇宙のニュース';
    }
    if (searchParams.has('q')) {
        defaultQueryString = searchParams.get('q');
    }

    const [loading, setLoading] = useState(0);
    const [queryString, setQueryString] = useState(defaultQueryString);
    const [sortingMethod, setSortingMethod] = useState('relevance');
    const [filterByDays, setFilterByDays] = useState(4);

    useEffect(()=>{
        router.push(pathname + '?' + createQueryString('q', defaultQueryString));
    },[]);

    return (
        <LoadingContext.Provider value={[loading, setLoading]}>
            <QueryStringContext.Provider value={[queryString, setQueryString]}>
                <SortingMethodContext.Provider value={[sortingMethod, setSortingMethod]}>
                    <FilterByDaysContext.Provider value={[filterByDays, setFilterByDays]}>
                        {children}
                    </FilterByDaysContext.Provider>
                </SortingMethodContext.Provider>
            </QueryStringContext.Provider>
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within an AppContextProvider');
    }
    return context;
}

export function useQueryString() {
    const context = useContext(QueryStringContext);
    if (context === undefined) {
        throw new Error('useQueryString must be used within an AppContextProvider');
    }
    return context;
}

export function useSortingMethod() {
    const context = useContext(SortingMethodContext);
    if (context === undefined) {
        throw new Error('useSortingMethod must be used within an AppContextProvider');
    }
    return context;
}

export function useFilterByDays() {
    const context = useContext(FilterByDaysContext);
    if (context === undefined) {
        throw new Error('useFilterByDays must be used within an AppContextProvider');
    }
    return context;
}
