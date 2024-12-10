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
      "http://rss.sciam.com/ScientificAmerican-Global",
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
      "http://www.astroarts.co.jp/article/feed.atom",
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
      "https://www.marketwatch.com/rss/topstories",
      "http://rss.politico.com/economy.xml",
      "https://www.theguardian.com/business/rss",
      "https://www.ft.com/global-economy?format=rss",
      "https://www.ft.com/companies/financials?format=rss"
    ],
    defaultQuery: 'significant financial and economic news'
  },
  'uk-politics': {
    feeds: [
      "https://www.theguardian.com/politics/rss",
      "https://www.telegraph.co.uk/politics/rss.xml",
      "https://www.ft.com/world/uk?format=rss"
    ],
    defaultQuery: 'important UK political news and developments'
  },
  'us-politics': {
    feeds: [
      "https://www.theguardian.com/us-news/us-politics/rss",
      "http://rss.politico.com/congress.xml",
      "https://rss.politico.com/politics-news.xml",
      "https://www.ft.com/world/us?format=rss"
    ],
    defaultQuery: 'important US political news and developments'
  },
  'uk-news': {
    feeds: [
      "https://www.theguardian.com/uk-news/rss",
      "https://www.telegraph.co.uk/news/rss.xml"
    ],
    defaultQuery: 'important UK news'
  },
  'international-news': {
    feeds: [
      "https://www.theguardian.com/world/rss",
      "https://www.theguardian.com/world/middleeast/rss",
      "https://www.theguardian.com/world/ukraine/rss",
      "https://www.ft.com/world?format=rss",
      "https://www.ft.com/world/europe?format=rss",
      "https://www.ft.com/world/mideast?format=rss"
    ],
    defaultQuery: 'important international news and developments'
  }
} 