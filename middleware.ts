import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';

export const config = {
    matcher: '/:path*',
};

export default function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    const urlLocale = url.searchParams.get('locale');

    if (urlLocale && ['ja-JP'].includes(urlLocale)) {
        return NextResponse.rewrite(url);
    }

    const details = geolocation(request);

    const countryCodeToLocaleMap = {
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
    }

    const countryCode = details.country ? details.country : 'US';
    const locale = countryCodeToLocaleMap[countryCode as keyof typeof countryCodeToLocaleMap] || 'en-US';

    // Check if the locale is valid and append it to the URL
    if (locale && ['ja-JP'].includes(locale)) {
        url.searchParams.set('locale', locale);
    } else {
        // Remove locale to fallback to en-US
        url.searchParams.delete('locale');
    }

    return NextResponse.rewrite(url);
} 