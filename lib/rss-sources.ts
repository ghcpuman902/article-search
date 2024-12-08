export type RSSSourceCategory = {
  feeds: string[]
  defaultQuery: string
}

export const RSS_SOURCES: Record<string, RSSSourceCategory> = {
  'astronomy': {
    feeds: [
      "https://scitechdaily.com/feed/",
      "https://phys.org/rss-feed/space-news/",
      "https://www.universetoday.com/feed",
      "https://www.space.com/feeds/news",
      "https://www.sciencealert.com/feed",
      "https://skyandtelescope.org/astronomy-news/feed",
      "https://spacenews.com/feed/",
    //   "http://rss.sciam.com/ScientificAmerican-Global",
      "https://ras.ac.uk/rss.xml",
      "https://www.sci.news/astronomy/feed",
      "https://www.newscientist.com/subject/space/feed/",
      "https://theconversation.com/us/technology/articles.atom"
    ],
    defaultQuery: 'attention grabbing astronomy news'
  },
  'astronomy-jp': {
    feeds: [
      "https://sorae.info/feed",
      "https://www.nao.ac.jp/atom.xml",
    //   "http://www.astroarts.co.jp/article/feed.atom",
      "https://subarutelescope.org/jp/atom.xml",
      "https://alma-telescope.jp/news/feed",
      "https://www.jaxa.jp/rss/press_j.rdf"
    ],
    defaultQuery: '注目の天文ニュース'
  },
  'finance': {
    feeds: [
      "https://www.forbes.com/innovation/feed2",
      "https://www.ft.com/markets?format=rss",
      "https://feeds.bloomberg.com/markets/news.rss",
      "https://www.cnbc.com/id/10000664/device/rss/rss.html",
      "https://www.marketwatch.com/rss/topstories"
    ],
    defaultQuery: 'important financial news'
  }
} 