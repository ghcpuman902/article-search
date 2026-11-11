import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FEED_CACHE_EXPIRE_SECONDS,
  FEED_CACHE_REVALIDATE_SECONDS,
  FEED_CACHE_STALE_SECONDS,
  isFeedSnapshotOutdated,
} from './feed-cache-life.ts'

const APP_SHELL_STALE_SECONDS = 5 * 60

test('feed snapshots stay served while an hourly refresh runs in the background', () => {
  assert.equal(FEED_CACHE_STALE_SECONDS, 30)
  assert.ok(FEED_CACHE_STALE_SECONDS < APP_SHELL_STALE_SECONDS)
  assert.equal(FEED_CACHE_REVALIDATE_SECONDS, 60 * 60)
  assert.equal(FEED_CACHE_EXPIRE_SECONDS, Infinity)
  assert.ok(FEED_CACHE_EXPIRE_SECONDS > FEED_CACHE_REVALIDATE_SECONDS)
})

test('a snapshot is outdated only once the hourly revalidate window has passed', () => {
  const now = Date.parse('2026-11-11T10:00:00.000Z')
  assert.equal(isFeedSnapshotOutdated('2026-11-11T09:30:00.000Z', now), false)
  assert.equal(isFeedSnapshotOutdated('2026-11-11T08:59:59.000Z', now), true)
  assert.equal(isFeedSnapshotOutdated('not-a-date', now), true)
})
