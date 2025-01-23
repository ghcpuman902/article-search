export const experimental_ppr = true

import { GROUP_CONFIG, RSS_SOURCES } from '@/lib/rss-sources'
import { Footer } from '@/components/articles/footer'
import { SmartCategoryLink } from '@/components/smart-category-link'

export default async function HomePage() {
  const groupedCategories = Object.entries(RSS_SOURCES).reduce((acc, [key, value]) => {
    const group = value.group
    if (!acc[group]) acc[group] = []
    acc[group].push(key)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <main className="mx-auto w-full min-h-96 mt-2 mb-8">
      <p className="mb-8 max-w-prose text-pretty text-sm text-muted-foreground md:mb-8 md:text-base">
        ArticleSearch aggregates and ranks articles from diverse RSS sources, using OpenAI embeddings to intelligently sort results by relevance to your search query.
      </p>
      <div className="grid grid-cols-1 gap-4 xl:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(groupedCategories).map(([groupName, categories]) => (
          <section
            key={groupName}
            className="flex-1"
          >
            <h2 className="mb-4 text-2xl font-bold capitalize">
              {GROUP_CONFIG[groupName as keyof typeof GROUP_CONFIG].displayName}
            </h2>
            <div className="flex flex-col gap-4">
              {categories.map(category => (
                <SmartCategoryLink
                  key={category}
                  category={category}
                  defaultQuery={RSS_SOURCES[category].defaultQuery}
                  feedCount={RSS_SOURCES[category].feeds.length}
                  displayName={RSS_SOURCES[category].displayName}
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
