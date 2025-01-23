'use client'

import React, { memo } from 'react'
import { WindowVirtualizer } from 'virtua'
import { ArticleCard } from "./article-card"
import { Article } from "@/lib/types"

type VirtualizedArticlesListProps = {
  articles: Article[]
  locale: string
}

export const VirtualizedArticlesList = memo(function VirtualizedArticlesList({
  articles,
  locale
}: VirtualizedArticlesListProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="items-stretch justify-center rounded-lg w-full">
      <WindowVirtualizer>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            article ? (
              <ArticleCard
                locale={locale}
                key={article.key || `article-${index}`}
                article={article}
              />
            ) : null
          ))}
        </div>
      </WindowVirtualizer>
    </div>
  );
}); 