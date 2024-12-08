import Link from 'next/link'
import { RSS_SOURCES } from '@/lib/rss-sources'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">News Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(RSS_SOURCES).map(([category, config]) => (
          <Link
            key={category}
            href={`/${category}?q=${encodeURIComponent(config.defaultQuery)}`}
            className="p-6 border rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold capitalize">
                {category.replace('-', ' ')}
              </h2>
              <p className="text-sm text-neutral-600">
                {config.feeds.length} news sources
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
