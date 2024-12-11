'use client'
import { useState, useEffect } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
export function Header() {
    const segment = useSelectedLayoutSegment()
    const [displayedSegment, setDisplayedSegment] = useState(segment)

    useEffect(() => {
        if (segment) {
            setDisplayedSegment(segment)
        } else {
            // Delay clearing the segment until animation completes
            const timer = setTimeout(() => {
                setDisplayedSegment(null)
            }, 300)
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
                                    "transition-all inline-block",
                                    segment 
                                        ? "duration-1000 max-w-[200px] opacity-100" 
                                        : "duration-300 max-w-0 opacity-0"
                                )}>rticle</div>
                                <div className="transition-all duration-300 ease-out inline-block">S</div>
                                <div className={cn(
                                    "transition-all inline-block",
                                    segment 
                                        ? "duration-1000 opacity-100" 
                                        : "duration-300 opacity-0"
                                )}>
                                    earch
                                </div>
                            </div>
                            {displayedSegment && (
                                <span className="inline-block">
                                    {` / ${displayedSegment.charAt(0).toUpperCase() + displayedSegment.slice(1)}`}
                                </span>
                            )}
                        </div>
                    </div>
                </h1>
            </Link>
        </nav>
    )
}