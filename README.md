# ArticleSearch

ArticleSearch aggregates and ranks articles from diverse RSS sources, using OpenAI embeddings to intelligently sort results by relevance to your search query.

## Architecture Overview

### Core Components

- **Layout (`layout.tsx`)**: Main application shell that:
  - Maintains navigation state
  - Uses static rendering
  - Implements client-side components (Header/Nav) with suspense fallbacks
  - Provides theme support and analytics integration

- **Home Page (`page.tsx`)**:
  - Static rendering from RSS sources
  - Auto-revalidates daily
  - Uses cache tags for invalidation when database updates occur

- **Category Pages (`[category]/page.tsx`)**:
  - Dynamic rendering with cached article data
  - Uses `getArticles` with 2-hour revalidation
  - Renders through `ArticleGrid` component

### Caching Strategy

The application implements a multi-level caching strategy:

1. **Article Fetching**:
   - Base cache life: 5 minutes stale
   - Revalidation: Every hour
   - Cache expiration: 4 hours
   - Article age filtering:
     - Max age: 32 days
     - Hide threshold: 4 days

2. **Page Rendering**:
   - Static pages with dynamic islands
   - Suspense boundaries for progressive loading
   - Client-side caching for repeated queries

### User Flow

#### First Page Visit
1. Load articles (server-side)
2. Filter by criteria → Initial render
3. Calculate embeddings
4. Sort by distance/date
5. Final render

#### Subsequent Visits (Same Category)
1. Load articles (cache hit)
2. Filter (cache hit) → Quick render
3. Use cached embeddings
4. Sort by new criteria
5. Final render

## Key Design Principles

1. **Minimal Embedding**
   - Embeddings calculated only when necessary
   - Cached for reuse within sessions

2. **Progressive Enhancement**
   - Core content loads first
   - Enhanced features load progressively
   - Suspense boundaries for smooth UX

3. **Performance Optimization**
   - Aggressive caching at multiple levels
   - Static generation where possible
   - Dynamic rendering only when needed

## Technical Implementation

### Caching Structure
```
|- layout.tsx (main shell, maintain navigation state)
|- page.tsx (static, daily revalidation)
|- [category]/page.tsx (dynamic with cached data)
    |-- ArticlesGrid.tsx (server component, cached)
```

### Performance Considerations

- Sort by distance is preserved for future features (e.g., newsletters)
- Query relevance threshold: <40% results are filtered
- Optimistic updates for filter changes (client-side first)

## Development Notes

- Environment: Next.js with TypeScript
- Key Dependencies:
  - OpenAI for embeddings
  - Vercel for analytics and tooling
  - Geist fonts for typography
  - Tailwind CSS for styling

## Future Considerations

- Newsletter integration based on relevance sorting
- Optimistic updates for filter changes
- Enhanced embedding strategies
- Performance optimization for special case URLs

## Note to self

```
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
```