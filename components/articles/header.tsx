'use client'
import { useState, useEffect } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RSS_SOURCES } from '@/lib/rss-sources'

const TRANSITION_DURATION = 300

const transitionClasses = {
    base: "transition-all inline-block",
    expanded: "duration-1000 max-w-[200px] opacity-100",
    collapsed: "duration-300 max-w-0 opacity-0",
}

export function Header() {
    const segment = useSelectedLayoutSegment()
    const [displayedSegment, setDisplayedSegment] = useState<string | null>(null)

    useEffect(() => {
        // Initialize with current segment on client
        setDisplayedSegment(segment)
        
        if (segment) {
            setDisplayedSegment(segment)
        } else {
            // queue to event loop using setTimeout to avoid race condition
            const timer = setTimeout(() => setDisplayedSegment(null), TRANSITION_DURATION)
            return () => clearTimeout(timer)
        }
    }, [segment])

    const getDisplayName = (slug: string) => {
        return RSS_SOURCES[slug]?.displayName || slug.charAt(0).toUpperCase() + slug.slice(1)
    }

    return (
        <header role="banner">
            <nav className="flex justify-between items-center mb-2 md:mb-4" role="navigation">
                <Link href="/">
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        <div className="relative flex flex-wrap items-center whitespace-nowrap">
                            <div key="a-letter" className="inline-block">A</div>
                            <div key="rticle-text" className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.collapsed : transitionClasses.expanded
                            )}>rticle</div>
                            <div key="s-letter" className="transition-all duration-300 ease-out inline-block">S</div>
                            <div key="earch-text" className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.collapsed : transitionClasses.expanded
                            )}>earch</div>
                            <div key="segment-text" className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.expanded : transitionClasses.collapsed
                            )}>
                                {displayedSegment && (
                                    <span className="inline-block">
                                        {`/ ${getDisplayName(displayedSegment)}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </h1>
                </Link>
            </nav>
        </header>
    )
}