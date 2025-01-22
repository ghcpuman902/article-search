## caching structure
|- layout.tsx (main shell, maintain nagivation state, static rendering, import Header/Nav (client component that useSelectedLayoutSegment) but with suspense fallback)
|- page.tsx (static from rss sources, auto revalidate every day to response to potential data source changes like db in the future, with cache tag that can be used to invalidate cache when user update db)
|- [category]/page.tsx (dynamic, but use getArticles which is cached and revalidate every 2 hrs, and pass data to ArticleGrid)
    |-- ArticlesGrid.tsx (server component, cached, using article input as cache key. and search params)
|- [category]/page.tsx (static rendering, import ArticlesGrid but with suspense fallback)


KEY POINT:
- nothing is embedded unless necessary
- cache as much as possible

when user visit new page:
- load articles
- filter by filter criteria -> render first
- calculate their embeddings
- sort by distance or date
- render

when user visit page with same cat but new query
- load articles (cache HIT)
- filter by filter criteria -> cache HIT hopefully -> render caceh hit hopefully
- caculate their embeddings -> cache HIT, same set of articles
- sort by new distance or date
- render

Sort by distance is important as future things like newsletter depends on it
- if any default query yields <40%, dont bother show to user or use in future calculation -> maybe will contradict with "embed only necessary"

The percentage is different for each of the keywords and pages and sources.
Maybe use 4o-mini to tag?v -> tested but too slow



!!!!!!!!!!!! when use change filterBy, can we use optmistic to update clientside first before server return result?