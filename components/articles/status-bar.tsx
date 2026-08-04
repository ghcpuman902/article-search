'use client'

import React, { useState } from 'react'

import { toast } from '@/hooks/use-toast'
import { Dictionary } from '@/lib/utils'

const FILTER_TEXT_MAP = {
  30: 'one-month',
  7: 'one-week',
  4: 'four-days',
  2: 'fourty-eight-hours',
} as const

const getFilterByKey = (days: number): string => {
  return FILTER_TEXT_MAP[days as keyof typeof FILTER_TEXT_MAP] ?? 'four-days'
}

type StatusBarProps = {
  dict: Dictionary
  visibleArticlesCount: number
  filterByDays: number
  queryString: string
  sortingMethod: string
  recommendationText: string
}

export const StatusBar = ({
  dict,
  visibleArticlesCount,
  filterByDays,
  queryString,
  sortingMethod,
  recommendationText,
}: StatusBarProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyRecommendations = async () => {
    if (!recommendationText) {
      toast({
        title: 'No articles to copy',
        description: 'Try adjusting your search or time filter.',
      })
      return
    }

    console.log(recommendationText)

    try {
      await navigator.clipboard.writeText(recommendationText)
      setCopied(true)
      toast({
        title: 'Copied top 10 articles',
        description: 'Title and URL list copied to clipboard.',
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy recommendations:', error)
      toast({
        title: 'Copy failed',
        description: 'Check the browser console for the article list.',
        variant: 'destructive',
      })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void handleCopyRecommendations()
    }
  }

  return (
    <div className="sticky top-0 left-0 right-0 z-50 py-6 flex place-content-center">
      <div
        role="button"
        tabIndex={0}
        aria-label={copied ? 'Copied top 10 articles' : 'Copy top 10 articles as text'}
        onClick={() => void handleCopyRecommendations()}
        onKeyDown={handleKeyDown}
        className="scroll-m-20 text-center tracking-tighter md:tracking-tight py-1 px-1 md:px-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-lg backdrop-saturate-200 shadow-[0px_4px_10px_2px_rgba(100,100,100,0.05)] border border-white border-opacity-70 dark:border-gray-600 dark:border-opacity-70 cursor-pointer select-none transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
      >
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600">
          {dict.title.articles_in_past_days
            .replace('[NUMBER]', visibleArticlesCount.toString())
            .replace('[DAYS]', filterByDays.toString())}
        </span>
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600">
          &quot;{queryString}&quot;
        </span>
        <span className="px-2 border-r border-neutral-300 dark:border-neutral-600 inline-block">
          {dict.label.sort_by}{' '}
          {sortingMethod === 'relevance' ? dict.label.relevance : dict.label.date}
        </span>
        <span className="px-2 inline-block">
          {dict.label.filter_by} {dict.label[getFilterByKey(filterByDays)]}
        </span>
      </div>
    </div>
  )
}
