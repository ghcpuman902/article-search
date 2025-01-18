'use client'
import { useState, useEffect } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TRANSITION_DURATION = 300

const transitionClasses = {
    base: "transition-all inline-block",
    expanded: "duration-1000 max-w-[200px] opacity-100",
    collapsed: "duration-300 max-w-0 opacity-0",
}

export function Header() {
    const segment = useSelectedLayoutSegment()
    const [displayedSegment, setDisplayedSegment] = useState(segment)

    useEffect(() => {
        if (segment) {
            setDisplayedSegment(segment)
        } else {
            // queue to event loop using setTimeout to avoid race condition
            const timer = setTimeout(() => setDisplayedSegment(null), TRANSITION_DURATION)
            return () => clearTimeout(timer)
        }
    }, [segment])

    return (
        <header role="banner">
            <nav className="flex justify-between items-center" role="navigation">
                <Link href="/">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        <div className="relative flex flex-wrap items-center whitespace-nowrap">
                            <div className="inline-block">A</div>
                            <div className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.collapsed : transitionClasses.expanded
                            )}>rticle</div>
                            <div className="transition-all duration-300 ease-out inline-block">S</div>
                            <div className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.collapsed : transitionClasses.expanded
                            )}>earch</div>
                            <div className={cn(
                                transitionClasses.base,
                                segment ? transitionClasses.expanded : transitionClasses.collapsed
                            )}>
                                {displayedSegment && (
                                    <span className="inline-block">
                                        {`/ ${displayedSegment.charAt(0).toUpperCase() + displayedSegment.slice(1)}`}
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