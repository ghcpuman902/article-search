'use client';

import { toast } from "sonner"

import { useEffect, useState } from 'react'
import { redirect, usePathname, useSearchParams } from 'next/navigation'

export const LocaleDetector = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [betaText, setBetaText] = useState('beta');

    useEffect(() => {
        const url = `${pathname}?${searchParams}`;
        if (pathname.endsWith('/article-search/jp')) {
            setBetaText('日本語版');
        } else {
            if (searchParams.has('jp')) {
                let defaultQueryString = '天文学の研究、宇宙探査、深宇宙のニュース';
                toast({
                    title: "🇯🇵リダイレクト中...",
                    description: "日本語版へリダイレクトしています -> https://manglekuo.com/works/article-search/jp",
                });
                redirect(
                    './article-search/jp/?q='
                    + (searchParams.has('q') ?
                        encodeURIComponent(searchParams.get('q')) :
                        defaultQueryString
                    )
                );
            }
        }
    }, [pathname, searchParams])
    return (<span className={`text-lg ${betaText == '日本語版' ? 'text-red-500' : 'text-blue-600'} inline-block align-text-top`}>{betaText}</span>);
}