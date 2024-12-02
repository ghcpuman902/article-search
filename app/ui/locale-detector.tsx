'use client';

import { useToast } from "@/hooks/use-toast"
import React, { useEffect, useState } from 'react'
import { redirect, usePathname, useSearchParams } from 'next/navigation'

export const LocaleDetector = (): JSX.Element => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [betaText, setBetaText] = useState<string>('beta');
    const { toast } = useToast();

    useEffect(() => {
        if (pathname.endsWith('/article-search/jp')) {
            setBetaText('日本語版');
        } else {
            if (searchParams.has('jp')) {
                const defaultQueryString = '天文学の研究、宇宙探査、深宇宙のニュース';
                toast({
                    title: "🇯🇵リダイレクト中...",
                    description: "日本語版へリダイレクトしています -> https://as.manglekuo.com/jp",
                });
                redirect(
                    './jp/?q='
                    + (searchParams.has('q') ?
                        encodeURIComponent(searchParams.get('q') ?? '') :
                        defaultQueryString
                    )
                );
            }
        }
    }, [pathname, searchParams, toast]);

    return (
        <span 
            className={`text-lg ${betaText === '日本語版' ? 'text-red-500' : 'text-blue-600'} inline-block align-text-top`}
        >
            {betaText}
        </span>
    );
}
