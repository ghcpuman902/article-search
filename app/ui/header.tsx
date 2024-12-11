'use client'
import { useState, useEffect, useMemo } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TRANSITION_DURATION = 300

export function Header() {
    const segment = useSelectedLayoutSegment()
    const [displayedSegment, setDisplayedSegment] = useState(segment)

    const transitionClasses = useMemo(() => ({
        base: "transition-all inline-block",
        expanded: "duration-1000 max-w-[200px] opacity-100",
        collapsed: "duration-300 max-w-0 opacity-0",
    }), [])

    useEffect(() => {
        if (segment) {
            setDisplayedSegment(segment)
        } else {
            const timer = setTimeout(() => {
                setDisplayedSegment(null)
            }, TRANSITION_DURATION)
            return () => clearTimeout(timer)
        }
    }, [segment])

    return (
        <nav className="flex justify-between items-center">
            <Link href="/">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    <div className="relative">
                        {/* Long version - Article Search */}
                        <div className="flex flex-wrap items-center">
                            <div className="whitespace-nowrap">
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

                        </div>
                    </div>
                </h1>
            </Link>
        </nav>
    )
}