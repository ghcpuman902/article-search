// Average proxy execution time: ~0.035ms
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';

export const config = {
    matcher: '/:path*',
    runtime: 'experimental-edge',
};

const countryCodeToLocaleMap: Record<string, string> = {
    'JP': 'ja-JP',
    'US': 'en-US',
    'CA': 'en-US',
    'GB': 'en-US',
    'AU': 'en-US',
    'NZ': 'en-US',
    'SG': 'en-US',
    'HK': 'zh-CN',
    'CN': 'zh-CN',
    'TW': 'zh-CN',
};

const SUPPORTED_LOCALES = new Set(['ja-JP', 'zh-CN']);

export default function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();
    const urlLocale = url.searchParams.get('locale');

    if (urlLocale && SUPPORTED_LOCALES.has(urlLocale)) {
        return NextResponse.rewrite(url);
    }

    let countryCode = 'US';

    const cachedCountry = request.headers.get('x-country-code');
    if (cachedCountry) {
        countryCode = cachedCountry;
    } else {
        const details = geolocation(request);
        countryCode = details.country || 'US';
    }

    const locale = countryCodeToLocaleMap[countryCode] || 'en-US';

    if (SUPPORTED_LOCALES.has(locale)) {
        url.searchParams.set('locale', locale);
    } else {
        url.searchParams.delete('locale');
    }

    const response = NextResponse.rewrite(url);
    response.headers.set('x-country-code', countryCode);
    
    return response;
}