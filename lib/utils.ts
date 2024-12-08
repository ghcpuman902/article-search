import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Buffer } from 'buffer';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Dictionary {
    title: {
        article_search: string;
        articles_in_past_days: string;
    };
    label: {
        [key: string]: string;
    };
    button: {
        [key: string]: string;
    };
    zoneBadgeNames: string[];
    loading_text: {
        [key: string]: string;
    };
    toast_text: {
        [key: string]: string;
    };
}

export function getDictionary(locale?: string): Dictionary {
    if (locale === 'ja-JP') {
        return {
            "title": {
                "article_search": "記事検索",
                "articles_in_past_days": "過去[DAYS]日間の記事：[NUMBER]件"
            },
            "label": {
                "article_sources": "記事ソース：",
                "input_hint": "次のテキストに近い記事でソート：",
                "last_fetched": "毎時自動取得、最後の取得は[TIME AGO]。",
                "please_refresh": "新しい記事のリストを取得するために、再度更新してください。",
                "loading": "読み込み中...",
                "sort_by": "ソート",
                "relevance": "関連性",
                "date": "日付",
                "filter_by": "フィルタ",
                "one-month": "1ヶ月",
                "one-week": "1週間",
                "four-days": "4日間",
                "fourty-eight-hours": "48時間",
                "having-issues": "問題がありますか？",
                "issue-alert-title":"うーん、予定よりも時間がかかっています...",
                "issue-alert-description":`試してみてください:
                1.あなたのローカルキャッシュデータをクリアする
                2.ページを再読込する
                原因:
                1.インターネット接続が悪い (中国にいる場合はVPNを試してみてください)
                2.あなたのローカルキャッシュデータが破損している可能性があります
                もし問題が続く場合は、次のアドレスに連絡してください: manglekuo@gmail.com または WeChat: manglekuo.`
            },
            "button": {
                "search": "検索",
                "sort": "並べ替え",
                "sort_newest_first": "最新のものから",
                "wait": "待機...",
                "clear-all-data": "すべてのデータを消去",
                "reload": "再読込"
            },
            "zoneBadgeNames": ['不適当', '可能', '良好', '絶妙', '似た話題', '同じ記事', ''],
            "loading_text": {
                "getting_articles": "記事取得中...",
                "getting_embedding": `"[QUERY TEXT]]"の埋め込み取得中...`,
                "article_embedding": "記事の埋め込み取得中＋距離計算...",
                "sorting_articles": "記事並べ替え中...",
                "final_steps": "最終ステップ..."
            },
            "toast_text": {
                "using_local_cache": "ローカルにキャッシュされた記事を利用中 ",
                "using_server": "サーバーからの新しい記事を利用中 "
            }
        };
    } else {
        return {
            "title": {
                "article_search": "Article Search",
                "articles_in_past_days": "[NUMBER] articles in the past [DAYS] days",
            },
            "label": {
                "article_sources": "Article sources: ",
                "input_hint": "Sort by how closely the article matches: ",
                "last_fetched": "articles are fetched from these sources every hour, last fetch happened [TIME AGO].",
                "please_refresh": "Please refresh again for new list of articles.",
                "loading": "loading...",
                "sort_by": "Sort by",
                "relevance": "Relevance",
                "date": "Date",
                "filter_by": "Filter by",
                "one-month": "1month",
                "one-week": "1week",
                "four-days": "4days",
                "fourty-eight-hours": "48hrs",
                "having-issues": "Having issues? Try ",
                "issue-alert-title":"Hm.. it's taking longer than it should...",
                "issue-alert-description":`TRY:
                1. clear your local cached data 
                2. reload the page
                REASON:
                1. you have bad internet connection (try a VPN if you are in China)
                2. your local cached data might be corrupted  
                If issue persists, please contact me at manglekuo@gmail.com or on WeChat: manglekuo.`
            },
            "button": {
                "search": "Search",
                "sort": "Sort",
                "sort_newest_first": "Newest first",
                "wait": "wait...",
                "clear-all-data": "clear all data",
                "reload": "reload"
            },
            "zoneBadgeNames": ['Bad Match', 'Maybe', 'Good Match', 'Excellent Match', 'Similar Topic', 'Same Article', ''],
            "loading_text": {
                "getting_articles": "Getting articles...",
                "getting_embedding": `Getting embedding for "[QUERY TEXT]"...`,
                "article_embedding": "Getting article embeddings + calculating distances...",
                "sorting_articles": "Sorting articles...",
                "final_steps": "Final steps..."
            },
            "toast_text": {
                "using_local_cache": "Using locally cached articles ",
                "using_server": "Using new articles from server "
            }
        };
    }
}

export function timeAgo(date: Date | string | null, locale: string = 'en', now?: Date): string {
    if (!date) { return `not yet`; }
    const eventTime = date instanceof Date ? date : new Date(date);
    const currentTime = now || new Date();

    const diffInSeconds = Math.floor((currentTime.getTime() - eventTime.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Create the formatter
    const rtf = new Intl.RelativeTimeFormat(locale == 'jp' ? 'ja-JP' : 'en-US', {
        localeMatcher: "best fit",
        numeric: 'auto',
        style: "narrow",
    });

    if (diffInDays > 0) {
        return `${rtf.format(-diffInDays, 'day')} (${rtf.format(-diffInHours, 'hour')})`;
    }

    if (diffInHours > 0) {
        return `${rtf.format(-diffInHours, 'hour')}`;
    }

    if (diffInMinutes > 0) {
        return `${rtf.format(-diffInMinutes, 'minute')}`;
    }

    return `${rtf.format(-diffInSeconds, 'second')}`;
}

export function olderThan1hr(date: Date | string | null): boolean {
    if (!date) { return false; }
    const eventTime = date instanceof Date ? date : new Date(date);
    const currentTime = new Date();

    const diffInSeconds = Math.floor((currentTime.getTime() - eventTime.getTime()) / 1000);

    if(diffInSeconds > 3600){
        return true;
    }
    return false;
}

export function dotProduct(a: number[] | null, b: number[] | null): number | null {
    if (!a || !b || a.length != b.length) { return null; }
    let dotProduct = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
    }
    return dotProduct;
}

export function getDomainNameFromUrl(url: string): string {
    let hostname = new URL(url).hostname;
    let domainName = '';

    // Remove the 'www.' or 'rss.' from the domain name
    if (hostname.startsWith('www.') || hostname.startsWith('rss.')) {
        hostname = hostname.split('.').slice(1).join('.');
    }

    // If domain is ".com" then remove the .com
    if (hostname.includes('.com')) {
        domainName = hostname.replace('.com', '');
    } else {
        domainName = hostname;
    }

    return domainName;
}

export function formatDate(date: Date): string {
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()];
    const dayOfMonth = date.getUTCDate().toString().padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
    const formattedString = `${day}, ${dayOfMonth} ${months[date.getUTCMonth()]} ${year} ${hours}:${minutes}:${seconds} +0000`;
    return formattedString;
  }
  

export function customHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        // Use codePointAt instead of charCodeAt to properly handle UTF-16 surrogate pairs
        const char = text.codePointAt(i) || 0;
        // Fast hash calculation using bitwise operations
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
        
        // Skip the low surrogate if we just processed a surrogate pair
        if (char > 0xFFFF) {
            i++;
        }
    }
    // Convert to hex string and combine with length for more uniqueness
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    const lengthHex = text.length.toString(16).padStart(4, '0');
    // Take first 15 chars of hash + 4 chars length + last 15 chars of hash
    return hashHex.slice(0, 15) + lengthHex + hashHex.slice(-15);
}

export function encodeEmbedding(float64Array: Float64Array): string {
    // Create a Buffer from the float64Array's ArrayBuffer
    const buffer = Buffer.from(float64Array.buffer, float64Array.byteOffset, float64Array.byteLength);
    // Convert the Buffer to a base64 string
    return buffer.toString('base64');
}

export function decodeEmbedding(base64String: string): Float64Array {
    const buffer = Buffer.from(base64String, 'base64');
    // Create Float64Array directly from the buffer
    return new Float64Array(
        buffer.buffer, 
        buffer.byteOffset, 
        buffer.byteLength / Float64Array.BYTES_PER_ELEMENT
    );
}
