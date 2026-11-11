import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FEED_CACHE_EXPIRE_SECONDS,
  FEED_CACHE_REVALIDATE_SECONDS,
  FEED_CACHE_STALE_SECONDS,
} from './feed-cache-life.ts'

const APP_SHELL_STALE_SECONDS = 5 * 60
const SHORTEST_ARTICLE_FILTER_SECONDS = 48 * 60 * 60

test('feed snapshots refresh hourly and stay out of the app shell', () => {
  assert.equal(FEED_CACHE_STALE_SECONDS, 30)
  assert.ok(FEED_CACHE_STALE_SECONDS < APP_SHELL_STALE_SECONDS)
  assert.equal(FEED_CACHE_REVALIDATE_SECONDS, 60 * 60)
  assert.ok(FEED_CACHE_EXPIRE_SECONDS > FEED_CACHE_REVALIDATE_SECONDS)
  assert.ok(FEED_CACHE_EXPIRE_SECONDS < SHORTEST_ARTICLE_FILTER_SECONDS)
})
