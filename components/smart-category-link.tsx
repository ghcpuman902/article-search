'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { constructCategoryUrl } from '@/lib/local-storage'

interface SmartCategoryLinkProps {
  category: string
  defaultQuery: string
  feedCount: number
}

export function SmartCategoryLink({ category, defaultQuery, feedCount }: SmartCategoryLinkProps) {
  const formattedCategory = category.replace('-', ' ')
  const [href, setHref] = useState(constructCategoryUrl(category, defaultQuery))

  useEffect(() => {
    // Update href when component mounts (client-side)
    setHref(constructCategoryUrl(category, defaultQuery))
  }, [category, defaultQuery])

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={href}
        className="p-6 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <h3 className="text-xl font-semibold capitalize">{formattedCategory}</h3>
        <p className="text-sm text-neutral-600">{feedCount} news sources</p>
      </Link>
    </div>
  )
} 