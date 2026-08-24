import { type VercelConfig } from '@vercel/config/v1';

// Pre-warm the 'use cache: remote' RSS cache once a week, Monday 05:00 UTC
// (06:00 UK in summer / 05:00 in winter) so weekday visits read cached feeds.
// Stagger categories by 5 minutes so nine feed fetches don't overlap.
export const config: VercelConfig = {
  crons: [
    { path: '/api/revalidate-feeds?category=astronomy', schedule: '0 5 * * 1' },
    { path: '/api/revalidate-feeds?category=astronomy-jp', schedule: '5 5 * * 1' },
    { path: '/api/revalidate-feeds?category=ai', schedule: '10 5 * * 1' },
    { path: '/api/revalidate-feeds?category=ces', schedule: '15 5 * * 1' },
    { path: '/api/revalidate-feeds?category=finance', schedule: '20 5 * * 1' },
    { path: '/api/revalidate-feeds?category=uk-politics', schedule: '25 5 * * 1' },
    { path: '/api/revalidate-feeds?category=us-politics', schedule: '30 5 * * 1' },
    { path: '/api/revalidate-feeds?category=uk-news', schedule: '35 5 * * 1' },
    { path: '/api/revalidate-feeds?category=international-news', schedule: '40 5 * * 1' },
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
