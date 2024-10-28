import 'server-only';
import { formatDate } from './utils';

import * as htmlparser2 from "htmlparser2";
import render from "dom-serializer";

export const linkToKey = function (message) {
    // Replace symbols with ASCII characters
    const sanitizedLink = message.replace(/[^a-zA-Z0-9]+/g, '-');

    // Remove leading and trailing dashes
    return sanitizedLink.replace(/^-+|-+$/g, '');
}

// URLs of the RSS feeds
const rss_feeds = [
    "https://scitechdaily.com/feed/",
    "https://phys.org/rss-feed/space-news/",
    "https://www.universetoday.com/feed",
    "https://www.space.com/feeds/news",
    "https://www.sciencealert.com/feed",
    "https://skyandtelescope.org/astronomy-news/feed",
    "https://spacenews.com/feed/",
    "http://rss.sciam.com/ScientificAmerican-Global",
    "https://ras.ac.uk/rss.xml",
    "https://www.sci.news/astronomy/feed",
    "https://www.newscientist.com/subject/space/feed/",
    "https://theconversation.com/us/technology/articles.atom"
];

const rss_feed_jp = [
    "https://sorae.info/feed",
    "https://www.nao.ac.jp/atom.xml",
    "http://www.astroarts.co.jp/article/feed.atom",
    "https://subarutelescope.org/jp/atom.xml",
    "https://alma-telescope.jp/news/feed",
    "https://www.jaxa.jp/rss/press_j.rdf"
];

function convertMediaToImg(media) {
    if (Array.isArray(media) && media.length > 0 && media[0].url) {
        const { url: src, title: alt = '' } = media[0];
        let { width, height } = media[0];

        if (!width || !height) {
            const match = src.match(/(\d+)x(\d+)\.[\w\d]+$/i);
            if (match) {
                [width, height] = match.slice(1, 3);
            }
        }

        const widthAndHeight = width && height ? `width="${width}" height="${height}"` : ``;
        return `<img src="${src}" alt="${alt}" ${widthAndHeight}>`;
    }
    return '';
}

function parseDescription(oDescription) {
    if (!oDescription) {
        return { description: '', images: [] }
    }
    const dom = htmlparser2.parseDocument(oDescription);
    let images = [];

    function traverse(node) {
        if (node.type === 'root') {
            if (node.children) {
                return node.children.map(traverse).filter(Boolean);
            }
        } else if (node.type === 'text') {
            let text = node.data;
            // trimming spaces and replacing excessive spaces, newline and tab characters
            text = text ? text.trim().replace(/\s\s+/g, ' ') : '';
            return text=='The post'?'':text;
        } else if (node.type === 'tag') {
            if (node.name === 'img' || node.name === 'figure' || node.name === 'picture') {
                images.push(render(node));
            } else if (node.name === 'p' && node.children && node.children.length >= 1 && node.children[0].type === 'text') {
                let text = node.children[0]?.data;
                // trimming spaces and replacing excessive spaces, newline and tab characters
                text = text ? text.trim().replace(/\s\s+/g, ' ') : '';
                return text=='The post'?'':text;
            } else if (node.name === 'p' && node.children) {
                return node.children.map(traverse).filter(Boolean);
            }
        }
    }
    const description = traverse(dom).join(' ');
    // console.log(description);
    return { description, images };
}

export const fetchArticlesFromFeed = async (url) => {
    let articles = [];
    let currentTime = (new Date()).getTime();
    try {
        const response = await fetch(url);
        const data = await response.text();
        const parsedResult = htmlparser2.parseFeed(data, { xmlMode: true });

        const types = ['rss', 'atom', 'rdf'];
        if (!parsedResult) {
            // skip
            return [];
        }
        if (types.includes(parsedResult.type) && parsedResult.items) {
            const items = parsedResult.items;
            for (let item of items) {
                const title = item.title;
                const link = item.link;
                const pubDate = item.pubDate;
                let { description, images } = parseDescription(item.description);

                const image = convertMediaToImg(item.media) || images[0] || '';

                articles.push({ title, link, pubDate, description, image, source: url, distance: null, embedding: null, key: linkToKey(link) });
            }
        } else {
            console.error(`Unexpected XML structure for URL: ${url}, possible type: ${parsedResult.type || 'unknown'}`);
            return [];
        }

    } catch (error) {
        console.error(`Error fetching the feed for URL: ${url}`, error);
        return [];
    }
    return articles;
};


async function fetchArticles(urls) {
    let allArticles = [];
    let successfulSources = [];
    const currentTime = (new Date()).getTime();
    const MAX_AGE_IN_MILLISECONDS = 32 * 24 * 60 * 60 * 1000;
    const HIDE_TIME_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000;

    const promises = urls.map(url => fetchArticlesFromFeed(url));
    const results = await Promise.all(promises);

    for (let i = 0; i < results.length; i++ ) {
      const articles = results[i];
      if (articles.length > 0) {
          successfulSources.push({ url: urls[i], count: articles.length });
          allArticles = allArticles.concat(articles);
      }
    }

    allArticles = allArticles.reduce((acc, article) => {
        const pubDateTimestamp = new Date(article.pubDate).getTime();
        const ageInMilliseconds = currentTime - pubDateTimestamp;
        const hidden = ageInMilliseconds > HIDE_TIME_IN_MILLISECONDS;

        if (ageInMilliseconds <= MAX_AGE_IN_MILLISECONDS) {
            acc.push({ ...article, pubDate: pubDateTimestamp, hidden });
        }
        return acc;
    }, []);

    allArticles.sort((a, b) => b.pubDate - a.pubDate);

    return { articles: allArticles, successfulSources, updateTime: formatDate(new Date()) };
}

export const fetchAllArticles = async () => {
    console.log(`fetchAllArticles ${formatDate(new Date())}`);
    return fetchArticles(rss_feeds);
};

export const fetchAllJapanArticles = async () => {
    console.log(`fetchAllJapanArticles ${formatDate(new Date())}`);
    return fetchArticles(rss_feed_jp);
};