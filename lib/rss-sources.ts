import { Atom, Building2, LandPlot, Newspaper } from 'lucide-react'

export const GROUP_CONFIG = {
  'science': {
    icon: Atom,
    displayName: 'Science & Space'
  },
  'business': {
    icon: Building2,
    displayName: 'Business & Finance'
  },
  'politics': {
    icon: LandPlot,
    displayName: 'Politics'
  },
  'news': {
    icon: Newspaper,
    displayName: 'News'
  }
} as const

export type RSSSourceCategory = {
  feeds: string[]
  defaultQuery: string
  group: keyof typeof GROUP_CONFIG
  displayName: string
}

const uk_news_feeds = [
  {
    "name": "BBC RSS Feed",
    "url": "https://feeds.bbci.co.uk/news/rss.xml",
    "description": "The BBC stands as a beacon of journalistic excellence, delivering comprehensive and impartial news coverage that spans the globe.",
    "hashtags": ["#BBCNews", "#Journalism", "#UKNews"]
  },
  {
    "name": "The Guardian » UK RSS Feed",
    "url": "https://www.theguardian.com/uk-news/rss",
    "description": "Offers nuanced and deeply insightful perspectives on global affairs, culture, and the environment.",
    "hashtags": ["#TheGuardian", "#GlobalNews", "#Insightful"]
  },
  {
    "name": "Sky News RSS Feed",
    "url": "https://feeds.skynews.com/feeds/rss/home.xml",
    "description": "Sky News stands at the forefront of global journalism, delivering real-time updates and in-depth analysis on the most pressing issues across the globe.",
    "hashtags": ["#SkyNews", "#BreakingNews", "#GlobalNews"]
  },
  {
    "name": "The Telegraph RSS Feed",
    "url": "https://www.telegraph.co.uk/rss.xml",
    "description": "The Telegraph stands as a paragon of journalistic integrity, offering its readership a sophisticated blend of breaking news, incisive opinion pieces, and in-depth analysis.",
    "hashtags": ["#Telegraph", "#News", "#Analysis"]
  },
  {
    "name": "The Independent RSS Feed",
    "url": "https://www.independent.co.uk/rss",
    "description": "The Independent stands as a bastion of thoughtful journalism, offering an incisive perspective on the world's most pressing issues.",
    "hashtags": ["#Independent", "#ThoughtfulJournalism", "#WorldNews"]
  },
  {
    "name": "HuffPost UK RSS Feed",
    "url": "https://www.huffingtonpost.co.uk/feeds/index.xml",
    "description": "HuffPost UK blends news with diverse voices for a balanced narrative.",
    "hashtags": ["#HuffPostUK", "#DiverseVoices", "#BalancedNarrative"]
  },
  {
    "name": "Daily Record RSS Feed",
    "url": "https://www.dailyrecord.co.uk/news/?service=rss",
    "description": "The Daily Record stands as a vital source of news and cultural commentary within Scotland.",
    "hashtags": ["#DailyRecord", "#ScottishNews", "#CulturalCommentary"]
  },
  {
    "name": "Politics.co.uk RSS Feed",
    "url": "https://www.politics.co.uk/feed/",
    "description": "Politics.co.uk offers thorough examination of the latest developments within the political landscape of the UK.",
    "hashtags": ["#PoliticsUK", "#UKPolicy", "#PoliticalNews"]
  },
  {
    "name": "The Mirror RSS Feed",
    "url": "https://www.mirror.co.uk/?service=rss",
    "description": "The Mirror delivers a dynamic blend of breaking news, insightful political commentary, and vibrant celebrity gossip.",
    "hashtags": ["#MirrorNews", "#BreakingNews", "#UKPolitics"]
  },
  {
    "name": "London Evening Standard RSS Feed",
    "url": "http://www.standard.co.uk/rss",
    "description": "The Evening Standard covers breaking news, political developments, and the latest in fashion, lifestyle, and entertainment.",
    "hashtags": ["#EveningStandard", "#LondonNews", "#Entertainment"]
  },
  {
    "name": "The Conversation UK RSS Feed",
    "url": "http://theconversation.com/uk/articles.atom",
    "description": "The Conversation merges academic expertise with journalism to offer profound insights into complex issues.",
    "hashtags": ["#TheConversation", "#InsightfulAnalysis", "#ExpertOpinions"]
  },
  {
    "name": "Daily Express RSS Feed",
    "url": "https://feeds.feedburner.com/daily-express-news-showbiz",
    "description": "Daily Express provides a mix of breaking news, commentary, and engaging lifestyle content.",
    "hashtags": ["#DailyExpress", "#BreakingNews", "#Lifestyle"]
  },
  {
    "name": "Metro.co.uk RSS Feed",
    "url": "https://metro.co.uk/feed/",
    "description": "Metro.co.uk offers fresh news updates in current affairs, entertainment, and sports with a modern voice.",
    "hashtags": ["#MetroNews", "#UKEntertainment", "#SportsUpdate"]
  },
  // {
  //   "name": "Manchester Evening News RSS Feed",
  //   "url": "https://www.manchestereveningnews.co.uk/?service=rss",
  //   "description": "Comprehensive coverage of news in Greater Manchester, offering timely updates and in-depth analysis.",
  //   "hashtags": ["#ManchesterNews", "#LocalUpdates", "#UKNews"]
  // },
  // {
  //   "name": "Birmingham Mail RSS Feed",
  //   "url": "https://www.birminghammail.co.uk/?service=rss",
  //   "description": "Birmingham Mail provides news, features, and sports coverage in Birmingham and the West Midlands.",
  //   "hashtags": ["#BirminghamNews", "#WestMidlands", "#Sports"]
  // },
  // {
  //   "name": "The Argus RSS Feed",
  //   "url": "https://www.theargus.co.uk/news/rss/",
  //   "description": "Provides coverage of news and events in Sussex.",
  //   "hashtags": ["#TheArgus", "#SussexNews", "#LocalUpdates"]
  // },
  // {
  //   "name": "The York Press RSS Feed",
  //   "url": "https://www.yorkpress.co.uk/news/rss/",
  //   "description": "Offers comprehensive coverage of news from York and North Yorkshire.",
  //   "hashtags": ["#YorkPress", "#YorkshireNews", "#LocalNews"]
  // },
  // {
  //   "name": "The Northern Echo RSS Feed",
  //   "url": "https://www.thenorthernecho.co.uk/news/rss/",
  //   "description": "Provides comprehensive coverage of regional news from the North East of England.",
  //   "hashtags": ["#NorthernEcho", "#RegionalNews", "#NorthEastEngland"]
  // },
  // {
  //   "name": "The Bolton News RSS Feed",
  //   "url": "https://www.theboltonnews.co.uk/news/rss/",
  //   "description": "Key source of news and information for the Bolton area.",
  //   "hashtags": ["#BoltonNews", "#LocalUpdates", "#CommunityNews"]
  // },
  // {
  //   "name": "The Scarborough News RSS Feed",
  //   "url": "https://www.thescarboroughnews.co.uk/rss",
  //   "description": "Major news provider on the East Coast covering Scarborough.",
  //   "hashtags": ["#ScarboroughNews", "#EastCoast", "#LocalUpdates"]
  // },
  // {
  //   "name": "Northern Ireland World RSS Feed",
  //   "url": "https://www.larnetimes.co.uk/news/rss",
  //   "description": "Digital hub for news, events, and stories from Northern Ireland.",
  //   "hashtags": ["#NorthernIrelandNews", "#CommunityUpdates", "#LocalStories"]
  // },
  // {
  //   "name": "WalesOnline RSS Feed",
  //   "url": "https://www.walesonline.co.uk/?service=rss",
  //   "description": "Digital platform offering news and stories capturing Welsh life.",
  //   "hashtags": ["#WalesOnline", "#WelshNews", "#CulturalUpdates"]
  // },
  // {
  //   "name": "The Herald Scotland RSS Feed",
  //   "url": "https://www.heraldscotland.com/news/rss/",
  //   "description": "Scottish national newspaper providing news and cultural commentary.",
  //   "hashtags": ["#HeraldScotland", "#ScottishNews", "#CulturalCommentary"]
  // },
  // {
  //   "name": "Belfast Live RSS Feed",
  //   "url": "https://www.belfastlive.co.uk/?service=rss",
  //   "description": "Offers the latest news from Belfast and Northern Ireland.",
  //   "hashtags": ["#BelfastNews", "#NorthernIreland", "#LocalUpdates"]
  // },
  // {
  //   "name": "Cambridgeshire Live RSS Feed",
  //   "url": "http://www.cambridge-news.co.uk/rss.xml",
  //   "description": "Covers news, sport, and events from around Cambridgeshire.",
  //   "hashtags": ["#CambridgeNews", "#LocalUpdates", "#Events"]
  // },
  // {
  //   "name": "The Irish Times RSS Feed",
  //   "url": "https://www.irishtimes.com/cmlink/news-1.1319192",
  //   "description": "Ireland's quality daily newspaper covering national and international news.",
  //   "hashtags": ["#IrishTimes", "#QualityNews", "#Ireland"]
  // },
  // {
  //   "name": "Grimsby Telegraph RSS Feed",
  //   "url": "https://www.grimsbytelegraph.co.uk/news/?service=rss",
  //   "description": "Covers news, sport, and entertainment in North East Lincolnshire.",
  //   "hashtags": ["#GrimsbyNews", "#LocalUpdates", "#CommunityNews"]
  // },
  // {
  //   "name": "Glasgow Times RSS Feed",
  //   "url": "https://www.glasgowtimes.co.uk/news/rss/",
  //   "description": "Provides the latest news from Glasgow and across Scotland.",
  //   "hashtags": ["#GlasgowNews", "#ScottishNews", "#LocalUpdates"]
  // },
  // {
  //   "name": "NECN RSS Feed",
  //   "url": "https://www.necn.com/?rss=y",
  //   "description": "Local news, weather, traffic, entertainment, and more from New England.",
  //   "hashtags": ["#NECN", "#LocalNews", "#NewEngland"]
  // },
  // {
  //   "name": "Deadline News RSS Feed",
  //   "url": "https://www.deadlinenews.co.uk/feed/",
  //   "description": "One of Scotland's leading press and picture agencies serving national newspapers.",
  //   "hashtags": ["#DeadlineNews", "#ScottishPress", "#NewsAgency"]
  // },
  // {
  //   "name": "Positive News RSS Feed",
  //   "url": "https://www.positive.news/feed/",
  //   "description": "Focuses on stories of progress, sustainability, and human kindness.",
  //   "hashtags": ["#PositiveNews", "#GoodNews", "#Optimism"]
  // },
  // {
  //   "name": "London Journal RSS Feed",
  //   "url": "https://londonjournal.co.uk/feed/",
  //   "description": "National and international trending news stories.",
  //   "hashtags": ["#LondonJournal", "#TrendingNews", "#International"]
  // },
  // {
  //   "name": "Breaking News Today RSS Feed",
  //   "url": "https://www.breakingnewstoday.co.uk/feed/",
  //   "description": "Provides in-depth features, analysis, and news across the UK.",
  //   "hashtags": ["#BreakingNews", "#UKNews", "#Analysis"]
  // },
  // {
  //   "name": "Consett Magazine RSS Feed",
  //   "url": "https://consettmagazine.com/feed/",
  //   "description": "Positive local content about the town of Consett in North East England.",
  //   "hashtags": ["#ConsettMagazine", "#LocalContent", "#PositiveNews"]
  // },
  // {
  //   "name": "The Daily Mash RSS Feed",
  //   "url": "https://www.thedailymash.co.uk/feed",
  //   "description": "Satirical news site providing humorous exaggerations and parodies of current events.",
  //   "hashtags": ["#TheDailyMash", "#Satire", "#Comedy"]
  // },
  // {
  //   "name": "The Scotsman News RSS Feed",
  //   "url": "https://www.scotsman.com/news/rss",
  //   "description": "Scottish perspective on news, sport, business, and more.",
  //   "hashtags": ["#TheScotsman", "#ScottishPerspective", "#News"]
  // },
  // {
  //   "name": "The Scottish Sun RSS Feed",
  //   "url": "https://www.thescottishsun.co.uk/feed/",
  //   "description": "Leading tabloid newspaper in Scotland offering news, sports, showbiz, and more.",
  //   "hashtags": ["#ScottishSun", "#Tabloid", "#Showbiz"]
  // },
  // {
  //   "name": "Scottish Field RSS Feed",
  //   "url": "https://www.scottishfield.co.uk/feed/",
  //   "description": "Scotland's leading luxury lifestyle magazine covering fine dining, interior design, and more.",
  //   "hashtags": ["#ScottishField", "#Lifestyle", "#Luxury"]
  // },
  // {
  //   "name": "Daily Echo RSS Feed",
  //   "url": "https://www.dailyecho.co.uk/news/rss/",
  //   "description": "Latest news from Southampton, Winchester, Eastleigh, Fareham, and across Hampshire.",
  //   "hashtags": ["#DailyEcho", "#HampshireNews", "#LocalUpdates"]
  // },
  // // these doesnt work somehow
  // {
  //   "name": "The Sun RSS Feed",
  //   "url": "https://www.thesun.co.uk/topic/conservative-leadership-contest/feed/",
  //   "description": "The Sun delivers a lively mix of breaking news, sports, entertainment, and celebrity gossip.",
  //   "hashtags": ["#TheSun", "#UKNews", "#Entertainment"]
  // },
  // {
  //   "name": "The News, Portsmouth RSS Feed",
  //   "url": "https://www.portsmouth.co.uk/rss/cmlink/1.7167516",
  //   "description": "Offers a wide range of coverage on local news, sports, and events in Portsmouth.",
  //   "hashtags": ["#PortsmouthNews", "#LocalEvents", "#Sports"]
  // },
  // {
  //   "name": "The Poke RSS Feed",
  //   "url": "https://www.thepoke.co.uk/feed/",
  //   "description": "Curates comedic content from around the internet.",
  //   "hashtags": ["#ThePoke", "#Comedy", "#Humor"]
  // },
  // {
  //   "name": "BreakingNews.ie RSS Feed",
  //   "url": "https://feeds.breakingnews.ie/bntopstories",
  //   "description": "Ireland's premier breaking news website providing up-to-the-minute news and sports reports.",
  //   "hashtags": ["#BreakingNewsIE", "#IrishNews", "#Sports"]
  // },
  // {
  //   "name": "Newsnet.scot RSS Feed",
  //   "url": "https://newsnet.scot/feed/",
  //   "description": "Offers news, current affairs, and opinion from Scotland.",
  //   "hashtags": ["#NewsnetScot", "#ScottishNews", "#Opinion"]
  // },
  // {
  //   "name": "KentNews.Online RSS Feed",
  //   "url": "https://www.kentnews.online/feed/",
  //   "description": "News about Kent written by people of Kent with a social-based news platform.",
  //   "hashtags": ["#KentNews", "#LocalJournalism", "#Community"]
  // },
  // {
  //   "name": "Wired UK RSS Feed",
  //   "url": "https://www.wired.co.uk/rss",
  //   "description": "Delivers cutting-edge journalism exploring the digital landscape and tech innovation.",
  //   "hashtags": ["#WiredUK", "#TechNews", "#Innovation"]
  // },
  // {
  //   "name": "Daily Politics RSS Feed",
  //   "url": "https://www.dailypolitics.com/feed.xml",
  //   "description": "Offers the latest news, comments, and analysis from the UK and around the world.",
  //   "hashtags": ["#DailyPolitics", "#PoliticalAnalysis", "#WorldNews"]
  // }
]


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
      // "https://ras.ac.uk/rss.xml",
      "https://www.sci.news/astronomy/feed",
      "https://www.newscientist.com/subject/space/feed/",
      "https://theconversation.com/us/technology/articles.atom"
    ],
    defaultQuery: 'attention grabbing astronomy news',
    group: 'science',
    displayName: 'Astronomy'
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
    defaultQuery: '注目の天文ニュース',
    group: 'science',
    displayName: 'Japanese Astronomy'
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
    defaultQuery: 'significant financial and economic news',
    group: 'business',
    displayName: 'Finance & Markets'
  },
  'uk-politics': {
    feeds: [
      "https://www.theguardian.com/politics/rss",
      "https://www.telegraph.co.uk/politics/rss.xml",
      "https://www.ft.com/world/uk?format=rss"
    ],
    defaultQuery: 'important UK political news and developments',
    group: 'politics',
    displayName: 'UK Politics'
  },
  'us-politics': {
    feeds: [
      "https://www.theguardian.com/us-news/us-politics/rss",
      "http://rss.politico.com/congress.xml",
      "https://rss.politico.com/politics-news.xml",
      "https://www.ft.com/world/us?format=rss"
    ],
    defaultQuery: 'important US political news and developments',
    group: 'politics',
    displayName: 'US Politics'
  },
  'uk-news': {
    feeds: uk_news_feeds.map(feed => feed.url),
    defaultQuery: 'important UK news',
    group: 'news',
    displayName: 'UK News'
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
    defaultQuery: 'important international news and developments',
    group: 'news',
    displayName: 'International News'
  }
} 