'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { constructCategoryUrl, getCategoryState, setCategoryState } from '@/lib/local-storage'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { UnifiedSearchParams, SortOption, FilterDaysOption } from '@/lib/types'
import * as React from "react"
import { type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export interface SmartCategoryLinkProps
  extends ComponentPropsWithoutRef<typeof Card> {
  category: string
  defaultQuery: string
  feedCount: number
  displayName: string
}

const SmartCategoryLink = React.forwardRef<
  React.ElementRef<typeof Card>,
  SmartCategoryLinkProps
>(({ category, defaultQuery, feedCount, displayName, className, ...props }, ref) => {
  const storedState = getCategoryState(category)
  const [query, setQuery] = useState(storedState?.q || defaultQuery)
  const [href, setHref] = useState('')

  useEffect(() => {
    const localStorageUrl = constructCategoryUrl(category, defaultQuery)
    setHref(localStorageUrl)
  }, [category, query, defaultQuery])

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    // Preserve existing state while only updating 'q'
    const currentState = getCategoryState(category)
    const params: UnifiedSearchParams = {
      sort: (currentState?.sort || 'relevance') as SortOption,
      days: (currentState?.days || '4') as FilterDaysOption,
      page: currentState?.page,
      q: newQuery
    }
    setCategoryState(category, params)
  }

  return (
    <Card
      ref={ref}
      className={cn("overflow-hidden group hover:border-primary/50 transition-colors", className)}
      {...props}
    >
      <CardHeader className="p-0">
        <div className="relative w-full aspect-video">
          <Image
            src={`/article-search/${category}.jpg`}
            alt={`${displayName} category`}
            width={1600}
            height={900}
            className="object-cover saturate-50 brightness-90 contrast-125 transition-all duration-500 group-hover:saturate-100 group-hover:brightness-110"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{displayName}</h3>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 relative before:absolute before:inset-0 before:rounded-full before:bg-green-500 before:animate-ping before:opacity-75" />
            <span className="text-xs text-muted-foreground">{feedCount} sources</span>
          </div>
        </div>
        <div className="relative" suppressHydrationWarning>
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pr-11 h-10 text-sm rounded-sm"
            placeholder="Enter search query..."
          />
          <Button size="icon" className="absolute right-0 top-0 bottom-0 h-10 w-10 rounded-sm" asChild>
            <Link href={href}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
SmartCategoryLink.displayName = "SmartCategoryLink"

export { SmartCategoryLink } 