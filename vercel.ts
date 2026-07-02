import { type VercelConfig } from '@vercel/config/v1';

// Pre-warm the 'use cache: remote' RSS cache on a schedule so real user
// requests read cached data instead of paying for a fresh fetch + parse
// of every RSS feed. Staggered by 5 minutes/category to avoid a burst of
// concurrent OpenAI + RSS work on the same tick.
export const config: VercelConfig = {
  crons: [
    { path: '/api/revalidate-feeds?category=astronomy', schedule: '0 * * * *' },
    { path: '/api/revalidate-feeds?category=astronomy-jp', schedule: '5 * * * *' },
    { path: '/api/revalidate-feeds?category=ai', schedule: '10 * * * *' },
    { path: '/api/revalidate-feeds?category=ces', schedule: '15 * * * *' },
    { path: '/api/revalidate-feeds?category=finance', schedule: '20 * * * *' },
    { path: '/api/revalidate-feeds?category=uk-politics', schedule: '25 * * * *' },
    { path: '/api/revalidate-feeds?category=us-politics', schedule: '30 * * * *' },
    { path: '/api/revalidate-feeds?category=uk-news', schedule: '35 * * * *' },
    { path: '/api/revalidate-feeds?category=international-news', schedule: '40 * * * *' },
  ],
  functions: {
    // RSS aggregation + embeddings on a cache miss can legitimately take
    // longer than a typical request; cap it well below the 300s Fluid
    // Compute default so a stuck feed can't run away with billed time.
    'app/[category]/**': {
      maxDuration: 60,
    },
    'app/api/revalidate-feeds/**': {
      maxDuration: 120,
    },
  },
};
