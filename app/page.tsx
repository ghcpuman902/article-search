import Link from 'next/link'
import { RSS_SOURCES } from '@/lib/rss-sources'
import { Footer } from '@/components/articles/footer'

export default function HomePage() {
  // Group the categories by their group property
  const groupedCategories = Object.entries(RSS_SOURCES).reduce((acc, [key, value]) => {
    const group = value.group
    if (!acc[group]) acc[group] = []
    acc[group].push(key)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="flex flex-col items-center min-h-96 py-8 w-full mx-auto max-w-[2000px]">
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 w-full">
        {Object.entries(groupedCategories).map(([groupName, categories]) => (
          <section key={groupName} className="break-inside-avoid-column mb-6">
            <h2 className="text-2xl font-bold mb-6 capitalize">
              {groupName.replace('-', ' ')}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {categories.map(category => (
                <Link
                  key={category}
                  href={`/${category}?q=${encodeURIComponent(RSS_SOURCES[category].defaultQuery)}`}
                  className="p-6 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold capitalize">
                      {category.replace('-', ' ')}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {RSS_SOURCES[category].feeds.length} news sources
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </div>
  )
}
