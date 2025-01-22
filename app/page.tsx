export const experimental_ppr = true
// import {
//   // unstable_cacheTag as cacheTag,
//   unstable_cacheLife as cacheLife,
//   // revalidateTag,
// } from 'next/cache'

import { RSS_SOURCES } from '@/lib/rss-sources'
import { Footer } from '@/components/articles/footer'
import { SmartCategoryLink } from '@/components/smart-category-link'


export default async function HomePage() {
  // 'use cache'
  // cacheLife('max')

  const groupedCategories = Object.entries(RSS_SOURCES).reduce((acc, [key, value]) => {
    const group = value.group
    if (!acc[group]) acc[group] = []
    acc[group].push(key)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <main className="flex flex-col items-center min-h-96 py-8 w-full mx-auto max-w-[2000px]">
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 w-full">
        {Object.entries(groupedCategories).map(([groupName, categories]) => (
          <section key={groupName} className="break-inside-avoid-column mb-6">
            <h2 className="text-2xl font-bold mb-6 capitalize">
              {groupName.replace('-', ' ')}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {categories.map(category => (
                <SmartCategoryLink
                  key={category}
                  category={category}
                  defaultQuery={RSS_SOURCES[category].defaultQuery}
                  feedCount={RSS_SOURCES[category].feeds.length}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  )
}
