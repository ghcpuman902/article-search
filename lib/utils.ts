import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Buffer } from 'buffer';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Dictionary {
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
    table: {
        [key: string]: string;
    };
    message: {
        no_articles_found: string;
        try_adjusting_filters: string;
        increase_time_range: string;
        modify_search_terms: string;
        check_back_later: string;
        relevance_sort_unavailable: string;
    };
}

export function getDictionary(locale?: string): Dictionary {
    const translations = {
        "article_search": {
            "en-US": "Article Search",
            "ja-JP": "記事検索",
            "zh-CN": "文章搜索"
        },
        "articles_in_past_days": {
            "en-US": "[NUMBER] articles in the past [DAYS] days",
            "ja-JP": "過去[DAYS]日間の記事：[NUMBER]件",
            "zh-CN": "过去[DAYS]天共[NUMBER]篇文章"
        },
        "article_sources": {
            "en-US": "Article sources: ",
            "ja-JP": "記事ソース：",
            "zh-CN": "文章来源："
        },
        "input_hint": {
            "en-US": "Sort by how closely the article matches: ",
            "ja-JP": "次のテキストに近い記事でソート：",
            "zh-CN": "按与以下文本的相似度排序："
        },
        "last_fetched": {
            "en-US": "articles are fetched from these sources every hour, last fetch happened [TIME AGO].",
            "ja-JP": "毎時自動取得、最後の取得は[TIME AGO]。",
            "zh-CN": "每小时自动获取，最后一次获取是[TIME AGO]。"
        },
        "please_refresh": {
            "en-US": "Please refresh again for new list of articles.",
            "ja-JP": "新しい記事のリストを取得するために、再度更新してください。",
            "zh-CN": "请再次刷新以获取新的文章列表。"
        },
        "loading": {
            "en-US": "loading...",
            "ja-JP": "読み込み中...",
            "zh-CN": "加载中..."
        },
        "sort_by": {
            "en-US": "Sort by",
            "ja-JP": "ソート",
            "zh-CN": "排序"
        },
        "relevance": {
            "en-US": "Relevance",
            "ja-JP": "関連性",
            "zh-CN": "相关性"
        },
        "date": {
            "en-US": "Date",
            "ja-JP": "日付",
            "zh-CN": "日期"
        },
        "filter_by": {
            "en-US": "Filter by",
            "ja-JP": "フィルタ",
            "zh-CN": "过滤"
        },
        "one-month": {
            "en-US": "1month",
            "ja-JP": "1ヶ月",
            "zh-CN": "1个月"
        },
        "one-week": {
            "en-US": "1week",
            "ja-JP": "1週間",
            "zh-CN": "1周"
        },
        "four-days": {
            "en-US": "4days",
            "ja-JP": "4日間",
            "zh-CN": "4天"
        },
        "fourty-eight-hours": {
            "en-US": "48hrs",
            "ja-JP": "48時間",
            "zh-CN": "48小时"
        },
        "having-issues": {
            "en-US": "Having issues? Try ",
            "ja-JP": "問題がありますか？",
            "zh-CN": "有问题？试试"
        },
        "issue-alert-title": {
            "en-US": "Hm.. it's taking longer than it should...",
            "ja-JP": "うーん、予定よりも時間がかかっています...",
            "zh-CN": "嗯... 比预期要慢..."
        },
        "issue-alert-description": {
            "en-US": `TRY:
                1. clear your local cached data 
                2. reload the page
                REASON:
                1. you have bad internet connection (try a VPN if you are in China)
                2. your local cached data might be corrupted  
                If issue persists, please contact me at manglekuo@gmail.com or on WeChat: manglekuo.`,
            "ja-JP": `試してみてください:
                1.あなたのローカルキャッシュデータをクリアする
                2.ページを再読込する
                原因:
                1.インターネット接続が悪い (中国にいる場合はVPNを試してみてください)
                2.あなたのローカルキャッシュデータが破損している可能性があります
                もし問題が続く場合は、次のアドレスに連絡してください: manglekuo@gmail.com または WeChat: manglekuo.`,
            "zh-CN": `试试:
                1.清除你的本地缓存数据
                2.刷新页面
                原因:
                1.你的互联网连接不好（如果你在中国，可以试试VPN）
                2.你的本地缓存数据可能损坏
                如果问题持续，请联系我: manglekuo@gmail.com 或 WeChat: manglekuo.`
        },
        "search": {
            "en-US": "Search",
            "ja-JP": "検索",
            "zh-CN": "搜索"
        },
        "sort": {
            "en-US": "Sort",
            "ja-JP": "並べ替え",
            "zh-CN": "排序"
        },
        "sort_newest_first": {
            "en-US": "Newest first",
            "ja-JP": "最新のものから",
            "zh-CN": "最新到最旧"
        },
        "wait": {
            "en-US": "wait...",
            "ja-JP": "待機...",
            "zh-CN": "等待中..."
        },
        "clear-all-data": {
            "en-US": "clear all data",
            "ja-JP": "すべてのデータを消去",
            "zh-CN": "清除所有数据"
        },
        "reload": {
            "en-US": "reload",
            "ja-JP": "再読込",
            "zh-CN": "刷新"
        },
        "zone_badge_names": {
            "en-US": ['Bad Match', 'Maybe', 'Good Match', 'Excellent Match', 'Similar Topic', 'Same Article', ''],
            "ja-JP": ['不適当', '可能', '良好', '絶妙', '似た話題', '同じ記事', ''],
            "zh-CN": ['不匹配', '可能', '良好', '绝妙', '相似话题', '相同文章', '']
        },
        "getting_articles": {
            "en-US": "Getting articles...",
            "ja-JP": "記事取得中...",
            "zh-CN": "获取文章中..."
        },
        "getting_embedding": {
            "en-US": 'Getting embedding for "[QUERY TEXT]"...',
            "ja-JP": '"[QUERY TEXT]"の埋め込み取得中...',
            "zh-CN": '"[QUERY TEXT]"的嵌入获取中...'
        },
        "article_embedding": {
            "en-US": "Getting article embeddings + calculating distances...",
            "ja-JP": "記事の埋め込み取得中＋距離計算...",
            "zh-CN": "获取文章嵌入并计算距离..."
        },
        "sorting_articles": {
            "en-US": "Sorting articles...",
            "ja-JP": "記事並べ替え中...",
            "zh-CN": "排序文章..."
        },
        "final_steps": {
            "en-US": "Final steps...",
            "ja-JP": "最終ステップ...",
            "zh-CN": "最终步骤..."
        },
        "using_local_cache": {
            "en-US": "Using locally cached articles ",
            "ja-JP": "ローカルにキャッシュされた記事を利用中 ",
            "zh-CN": "使用本地缓存的文章 "
        },
        "using_server": {
            "en-US": "Using new articles from server ",
            "ja-JP": "サーバーからの新しい記事を利用中 ",
            "zh-CN": "使用服务器的新文章 "
        },
        "filter_titles": {
            "en-US": "Filter titles...",
            "ja-JP": "タイトルで絵絞り込み...",
            "zh-CN": "按标题过滤..."
        },
        "columns": {
            "en-US": "Columns",
            "ja-JP": "列",
            "zh-CN": "列"
        },
        "title": {
            "en-US": "Title",
            "ja-JP": "タイトル",
            "zh-CN": "标题"
        },
        "source": {
            "en-US": "Source",
            "ja-JP": "ソース",
            "zh-CN": "来源"
        },
        "no_results": {
            "en-US": "No results.",
            "ja-JP": "結果がありません。",
            "zh-CN": "没有结果。"
        },
        "no_articles_found": {
            "en-US": "No articles found",
            "ja-JP": "記事が見つかりません",
            "zh-CN": "未找到文章"
        },
        "try_adjusting_filters": {
            "en-US": "Try adjusting your filters or search terms to find more articles.",
            "ja-JP": "フィルターや検索条件を調整して、より多くの記事を見つけてください。",
            "zh-CN": "请尝试调整过滤条件或搜索词以找到更多文章。"
        },
        "increase_time_range": {
            "en-US": "Increase the time range",
            "ja-JP": "期間を長くする",
            "zh-CN": "增加时间范围"
        },
        "modify_search_terms": {
            "en-US": "Modify your search terms",
            "ja-JP": "検索語を変更する",
            "zh-CN": "修改搜索词"
        },
        "check_back_later": {
            "en-US": "Check back later for new articles",
            "ja-JP": "後で新しい記事を確認する",
            "zh-CN": "稍后再来查看新文章"
        },
        "relevance_sort_unavailable": {
            "en-US": "Relevance sorting is temporarily unavailable. Articles are sorted by date instead.",
            "ja-JP": "関連性によるソートは一時的に利用できません。代わりに日付順でソートしています。",
            "zh-CN": "相关性排序暂时不可用。文章已按日期排序。"
        },
        "previous": {
            "en-US": "Previous",
            "ja-JP": "前へ",
            "zh-CN": "前一页"
        },
        "next": {
            "en-US": "Next",
            "ja-JP": "次へ",
            "zh-CN": "下一页"
        },
        "search_input": {
            "en-US": "Search articles",
            "ja-JP": "記事を検索",
            "zh-CN": "搜索文章"
        },
    };

    const localeMap = {
        'ja-JP': 'ja-JP',
        'zh-CN': 'zh-CN',
        'en-US': 'en-US'
    } as const;
    const selectedLocale = localeMap[locale as keyof typeof localeMap] || localeMap['en-US'];

    return {
        title: {
            article_search: translations.article_search[selectedLocale],
            articles_in_past_days: translations.articles_in_past_days[selectedLocale]
        },
        label: {
            article_sources: translations.article_sources[selectedLocale],
            input_hint: translations.input_hint[selectedLocale],
            last_fetched: translations.last_fetched[selectedLocale],
            please_refresh: translations.please_refresh[selectedLocale],
            loading: translations.loading[selectedLocale],
            sort_by: translations.sort_by[selectedLocale],
            relevance: translations.relevance[selectedLocale],
            date: translations.date[selectedLocale],
            filter_by: translations.filter_by[selectedLocale],
            "one-month": translations["one-month"][selectedLocale],
            "one-week": translations["one-week"][selectedLocale],
            "four-days": translations["four-days"][selectedLocale],
            "fourty-eight-hours": translations["fourty-eight-hours"][selectedLocale],
            "having-issues": translations["having-issues"][selectedLocale],
            "issue-alert-title": translations["issue-alert-title"][selectedLocale],
            "issue-alert-description": translations["issue-alert-description"][selectedLocale],
            search_input: translations.search_input[selectedLocale]
        },
        button: {
            search: translations.search[selectedLocale],
            sort: translations.sort[selectedLocale],
            sort_newest_first: translations.sort_newest_first[selectedLocale],
            wait: translations.wait[selectedLocale],
            "clear-all-data": translations["clear-all-data"][selectedLocale],
            reload: translations.reload[selectedLocale]
        },
        zoneBadgeNames: translations.zone_badge_names[selectedLocale],
        loading_text: {
            getting_articles: translations.getting_articles[selectedLocale],
            getting_embedding: translations.getting_embedding[selectedLocale],
            article_embedding: translations.article_embedding[selectedLocale],
            sorting_articles: translations.sorting_articles[selectedLocale],
            final_steps: translations.final_steps[selectedLocale]
        },
        toast_text: {
            using_local_cache: translations.using_local_cache[selectedLocale],
            using_server: translations.using_server[selectedLocale]
        },
        table: {
            filter_titles: translations.filter_titles[selectedLocale],
            columns: translations.columns[selectedLocale],
            title: translations.title[selectedLocale],
            source: translations.source[selectedLocale],
            date: translations.date[selectedLocale],
            no_results: translations.no_results[selectedLocale],
            previous: translations.previous[selectedLocale],
            next: translations.next[selectedLocale]
        },
        message: {
            no_articles_found: translations.no_articles_found[selectedLocale],
            try_adjusting_filters: translations.try_adjusting_filters[selectedLocale],
            increase_time_range: translations.increase_time_range[selectedLocale],
            modify_search_terms: translations.modify_search_terms[selectedLocale],
            check_back_later: translations.check_back_later[selectedLocale],
            relevance_sort_unavailable: translations.relevance_sort_unavailable[selectedLocale],
        },
    };
}

export function timeAgo(date: Date | string | null, locale: string = 'en-US', now?: Date): string {
    if (!date) { return `not yet`; }
    const eventTime = date instanceof Date ? date : new Date(date);
    const currentTime = now || new Date();

    const diffInSeconds = Math.floor((currentTime.getTime() - eventTime.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Create the formatter
    const rtf = new Intl.RelativeTimeFormat(locale, {
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

    if (diffInSeconds > 3600) {
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
    if (!url) return 'Unknown Source';
    
    try {
        const hostname = new URL(url).hostname;
        let domainName = '';

        // Remove the 'www.' or 'rss.' from the domain name
        if (hostname.startsWith('www.') || hostname.startsWith('rss.')) {
            domainName = hostname.slice(4);
        } else {
            domainName = hostname;
        }

        return domainName;
    } catch {
        return 'Unknown Source';
    }
}

export function formatDate(date: Date | string): string {
    // Convert string to Date if needed
    const dateObj = date instanceof Date ? date : new Date(date);

    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getUTCDay()];
    const dayOfMonth = dateObj.getUTCDate().toString().padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = dateObj.getUTCFullYear();
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');

    const formattedString = `${day}, ${dayOfMonth} ${months[dateObj.getUTCMonth()]} ${year} ${hours}:${minutes}:${seconds} +0000`;
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

export const linkToKey = (message: string): string => {
    const sanitizedLink = message.replace(/[^a-zA-Z0-9]+/g, '-')
    return sanitizedLink.replace(/^-+|-+$/g, '')
}