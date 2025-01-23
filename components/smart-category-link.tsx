'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { constructCategoryUrl, getCategoryState, setCategoryState } from '@/lib/local-storage'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight } from 'lucide-react'
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
  const [localQuery, setLocalQuery] = useState(storedState?.q || defaultQuery)
  const [href, setHref] = useState('')

  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const getDefaultQueryUrl = () => {
    const currentState = getCategoryState(category)
    const params: UnifiedSearchParams = {
      sort: (currentState?.sort || 'relevance') as SortOption,
      days: (currentState?.days || '4') as FilterDaysOption,
      page: currentState?.page,
      q: defaultQuery
    }
    return constructCategoryUrl(category, params.q || '')
  }

  return (
    <Card
      ref={ref}
      className={cn("overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer", className)}
      {...props}
    >
      <CardHeader className="p-0">
        <Link href={getDefaultQueryUrl()} suppressHydrationWarning>
          <div className="relative w-full aspect-video">
            <Image
              src={`/article-search/${category}.jpg`}
              alt={`${displayName} category`}
              width={1600}
              height={900}
              className="object-cover saturate-50 brightness-90 contrast-125 transition-all duration-500 group-hover:saturate-100 group-hover:brightness-110"
              suppressHydrationWarning
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-1">
        <div className="flex justify-between items-center">
          <Link href={getDefaultQueryUrl()} suppressHydrationWarning>
            <h3 className="text-xl font-semibold">{displayName}</h3>
          </Link>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 relative before:absolute before:inset-0 before:rounded-full before:bg-green-500 before:animate-ping before:opacity-75" />
            <span className="text-xs text-muted-foreground">{feedCount} sources</span>
          </div>
        </div>
        <div className="flex flex-col gap-0">
          <div className="relative flex flex-row items-center h-8">
            <Search className="absolute left-0 top-0 bottom-0 h-8 w-4 flex items-center justify-center text-muted-foreground" />
            <Input
              value={localQuery}
              onChange={(e) => {
                e.stopPropagation()
                setLocalQuery(e.target.value)
              }}
              onBlur={(e) => {
                handleQueryChange(e.target.value)
              }}
              className="pr-11 h-8 text-sm rounded-sm border-0 pl-6 focus-visible:ring-0 focus-visible:ring-offset-1 focus-visible:ring-offset-primary/10 bg-transparent"
              placeholder="Enter search query..."
              suppressHydrationWarning
            />
            <Link href={href} suppressHydrationWarning>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute right-0 top-0 bottom-0 mt-1 h-6 w-8 rounded-full" 
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {isClient && localQuery !== defaultQuery && (
            <div className="relative flex flex-row items-center h-8" suppressHydrationWarning>
              <Search className="absolute left-0 top-0 bottom-0 h-8 w-4 flex items-center justify-center text-muted-foreground opacity-50" />
              <Input
                value={defaultQuery}
                readOnly
                className="pr-11 h-8 text-sm rounded-sm border-0 pl-6 focus-visible:ring-0 focus-visible:ring-offset-1 focus-visible:ring-offset-primary/10 bg-transparent opacity-50"
                suppressHydrationWarning
              />
              <Link href={`/${category}?q=${defaultQuery.replace(/\s+/g, '+')}`} suppressHydrationWarning>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute right-0 top-0 bottom-0 mt-1 h-6 w-8 rounded-full opacity-50" 
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
SmartCategoryLink.displayName = "SmartCategoryLink"

export { SmartCategoryLink } 