"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { SquareArrowUpRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogLayout,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
} from "@workspace/ui/components/morphing-dialog"
import { LightweightMarkdown } from "@workspace/ui/components/lightweight-markdown"
import { cn } from "@workspace/ui/lib/utils"

export type FloatingInsightView = "card" | "circle" | "expanded"

export type FloatingInsightContent = {
  eyebrow?: string
  title: string
  subtitle: string
  cardPreview: string
  expandedMarkdown: string
}

export type FloatingInsightCardProps = {
  content: FloatingInsightContent
  className?: string
  defaultView?: FloatingInsightView
  positionClassName?: string
}

const iconButtonClassName =
  "flex border-none p-0! shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const INITIAL_SHRINK_MS = 3000
const CARD_SHRINK_MS = 1000
const CAPSULE_TITLE_DELAY_MS = 1200
const MARQUEE_START_DELAY_S = 1
const MARQUEE_SPEED_PX_PER_S = 40
const CAPSULE_TEXT_MAX_WIDTH = "14rem"
const MARQUEE_SCROLL_MARGIN_PX = 16
const SCROLL_FADE_HEIGHT_REM = 2.5

const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const

const MORPH_TRANSITION = {
  type: "tween" as const,
  duration: 0.28,
  ease: EASE_IN_OUT,
}

type MarqueeTextProps = {
  text: string
  active: boolean
  className?: string
}

const MarqueeText = ({ text, active, className }: MarqueeTextProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const textRef = React.useRef<HTMLSpanElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [scrollOffset, setScrollOffset] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!active || !containerRef.current || !textRef.current) {
      setScrollOffset(0)
      return
    }

    const containerWidth = containerRef.current.clientWidth
    const textWidth = textRef.current.scrollWidth - MARQUEE_SCROLL_MARGIN_PX * 2
    setScrollOffset(Math.max(0, textWidth - containerWidth))
  }, [active, text])

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full min-w-0 flex-1 items-center overflow-hidden", className)}
      style={{
        maskImage:
          scrollOffset > 0
            ? `linear-gradient(to right, transparent 0px, black ${MARQUEE_SCROLL_MARGIN_PX}px, black calc(100% - ${MARQUEE_SCROLL_MARGIN_PX}px), transparent 100%)`
            : "none",
        WebkitMaskImage:
          scrollOffset > 0
            ? `linear-gradient(to right, transparent 0px, black ${MARQUEE_SCROLL_MARGIN_PX}px, black calc(100% - ${MARQUEE_SCROLL_MARGIN_PX}px), transparent 100%)`
            : "none",
      }}
    >
      <motion.span
        ref={textRef}
        className="inline-block whitespace-nowrap text-xs font-medium leading-none"
        style={{
          paddingLeft: `calc(0.625rem + ${MARQUEE_SCROLL_MARGIN_PX}px)`,
          paddingRight: `calc(0.25rem + ${MARQUEE_SCROLL_MARGIN_PX}px)`,
          marginLeft: `-${MARQUEE_SCROLL_MARGIN_PX}px`,
        }}
        initial={false}
        animate={{
          transform:
            scrollOffset > 0 && active && !shouldReduceMotion
              ? `translateX(-${scrollOffset}px)`
              : "translateX(0)",
        }}
        transition={
          scrollOffset > 0 && active && !shouldReduceMotion
            ? {
                delay: MARQUEE_START_DELAY_S,
                duration: scrollOffset / MARQUEE_SPEED_PX_PER_S,
                ease: "linear",
              }
            : { duration: 0 }
        }
      >
        {text}
      </motion.span>
    </div>
  )
}

type ScrollFadePanelProps = {
  children: React.ReactNode
  className?: string
}

const ScrollFadePanel = ({ children, className }: ScrollFadePanelProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [showBottomFade, setShowBottomFade] = React.useState(false)

  const updateBottomFade = React.useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const hasOverflow = element.scrollHeight > element.clientHeight + 1
    const isAtBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 4
    setShowBottomFade(hasOverflow && !isAtBottom)
  }, [])

  React.useEffect(() => {
    updateBottomFade()

    const element = scrollRef.current
    if (!element) return

    element.addEventListener("scroll", updateBottomFade, { passive: true })

    const resizeObserver = new ResizeObserver(updateBottomFade)
    resizeObserver.observe(element)

    return () => {
      element.removeEventListener("scroll", updateBottomFade)
      resizeObserver.disconnect()
    }
  }, [updateBottomFade, children])

  const fadeMaskStyle = showBottomFade
    ? {
        maskImage: `linear-gradient(to bottom, black 0%, black calc(100% - ${SCROLL_FADE_HEIGHT_REM}rem), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, black 0%, black calc(100% - ${SCROLL_FADE_HEIGHT_REM}rem), transparent 100%)`,
      }
    : undefined

  return (
    <div
      ref={scrollRef}
      className={cn(
        "scrollbar-thin-transparent min-h-0 flex-1 overflow-y-auto scroll-pb-8",
        className
      )}
      style={fadeMaskStyle}
    >
      {children}
    </div>
  )
}

export const FloatingInsightCard = ({
  content,
  className,
  defaultView = "card",
  positionClassName = "fixed bottom-4 left-4 z-40",
}: FloatingInsightCardProps) => {
  const [view, setView] = React.useState<FloatingInsightView>(defaultView)
  const [isCircleHovered, setIsCircleHovered] = React.useState(false)
  const [showCapsuleTitle, setShowCapsuleTitle] = React.useState(false)

  const eyebrow = content.eyebrow ?? "What am I seeing?"
  const eyebrowLabel = eyebrow.endsWith("?") ? eyebrow.slice(0, -1) : eyebrow

  const initialShrinkTimerRef = React.useRef<number | null>(null)
  const cardShrinkTimerRef = React.useRef<number | null>(null)
  const capsuleTitleTimerRef = React.useRef<number | null>(null)
  const hasInteractedRef = React.useRef(false)

  const clearTimer = (timerRef: React.RefObject<number | null>) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const resetCapsuleState = React.useCallback(() => {
    setIsCircleHovered(false)
    setShowCapsuleTitle(false)
    clearTimer(capsuleTitleTimerRef)
  }, [])

  const clearAllTimers = React.useCallback(() => {
    clearTimer(initialShrinkTimerRef)
    clearTimer(cardShrinkTimerRef)
    clearTimer(capsuleTitleTimerRef)
  }, [])

  React.useEffect(() => {
    initialShrinkTimerRef.current = window.setTimeout(() => {
      setView((currentView) => {
        if (currentView !== "card" || hasInteractedRef.current) return currentView
        resetCapsuleState()
        return "circle"
      })
    }, INITIAL_SHRINK_MS)

    return () => {
      clearTimer(initialShrinkTimerRef)
    }
  }, [resetCapsuleState])

  const handleExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    clearAllTimers()
    setView("expanded")
  }

  const handleExpandedChange = (open: boolean) => {
    if (!open) {
      resetCapsuleState()
      setView("circle")
    }
  }

  const handleLayoutMouseEnter = () => {
    if (view === "card") {
      hasInteractedRef.current = true
      clearTimer(initialShrinkTimerRef)
      clearTimer(cardShrinkTimerRef)
      return
    }

    if (view === "circle") {
      setIsCircleHovered(true)
      clearTimer(capsuleTitleTimerRef)
      capsuleTitleTimerRef.current = window.setTimeout(() => {
        setShowCapsuleTitle(true)
      }, CAPSULE_TITLE_DELAY_MS)
    }
  }

  const handleLayoutMouseLeave = () => {
    if (view === "card") {
      clearTimer(cardShrinkTimerRef)
      cardShrinkTimerRef.current = window.setTimeout(() => {
        setView((currentView) => {
          if (currentView !== "card") return currentView
          resetCapsuleState()
          return "circle"
        })
      }, CARD_SHRINK_MS)
      return
    }

    if (view === "circle") {
      resetCapsuleState()
    }
  }

  const handleLayoutClick = () => {
    if (view !== "circle") return

    clearAllTimers()
    resetCapsuleState()
    setView("card")
  }

  const isCard = view === "card"
  const isCircle = view === "circle"

  return (
    <div className={cn(positionClassName, className)}>
      <MorphingDialog
        open={view === "expanded"}
        onOpenChange={handleExpandedChange}
        transition={MORPH_TRANSITION}
      >
        {(isCard || isCircle) && (
          <MorphingDialogLayout
            className={cn(
              "overflow-hidden border border-border bg-white/65 dark:bg-black/80 backdrop-blur-lg text-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/5",
              isCard &&
                "flex h-[min(20rem,calc(100vh-2rem))] w-[min(16rem,calc(100vw-2rem))] flex-col rounded-xl p-4",
              isCircle &&
                "relative flex h-9 cursor-pointer items-center rounded-full min-w-9 outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-[min(calc(100vw-2rem),20rem)]"
            )}
            onMouseEnter={handleLayoutMouseEnter}
            onMouseLeave={handleLayoutMouseLeave}
            onClick={isCircle ? handleLayoutClick : undefined}
            aria-label={isCircle ? "Open ArticleSearch summary card" : undefined}
            role={isCircle ? "button" : undefined}
            tabIndex={isCircle ? 0 : undefined}
            onKeyDown={
              isCircle
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleLayoutClick()
                    }
                  }
                : undefined
            }
          >
            {isCard ? (
              <>
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase leading-none tracking-wide text-muted-foreground">
                    {eyebrow}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={iconButtonClassName}
                    onClick={handleExpand}
                    aria-label="Expand ArticleSearch summary"
                  >
                    <SquareArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>

                <ScrollFadePanel className="mt-3">
                  <MorphingDialogTitle className="text-lg font-medium leading-tight">
                    {content.title}
                  </MorphingDialogTitle>
                  <MorphingDialogSubtitle className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {content.subtitle}
                  </MorphingDialogSubtitle>
                  <p className="mt-4 scroll-mb-8 pb-8 text-xs leading-relaxed text-muted-foreground">
                    {content.cardPreview}
                  </p>
                </ScrollFadePanel>
              </>
            ) : (
              <>
                <div
                  className="relative min-w-0 overflow-hidden ml-3"
                  style={{
                    maxWidth: isCircleHovered ? CAPSULE_TEXT_MAX_WIDTH : "0px",
                    transitionProperty: "max-width",
                    transitionDuration: !isCircleHovered ? "280ms" : "0ms",
                    transitionTimingFunction: "cubic-bezier(0.645, 0.045, 0.355, 1)",
                  }}
                >
                  <span
                    className="block text-xs font-medium leading-none whitespace-nowrap"
                    style={{
                      opacity: isCircleHovered && !showCapsuleTitle ? 1 : 0,
                      transitionProperty: "opacity",
                      transitionDuration:
                        isCircleHovered && showCapsuleTitle
                          ? "0ms"
                          : !isCircleHovered
                            ? "0ms"
                            : "150ms",
                    }}
                    aria-hidden={!isCircleHovered || showCapsuleTitle}
                  >
                    {eyebrowLabel}
                  </span>
                </div>

                <span
                  className="flex h-6 mr-3 shrink-0 items-center justify-center text-sm font-semibold leading-none text-primary transition-opacity"
                  style={{
                    opacity: isCircleHovered && showCapsuleTitle ? 0 : 1,
                    transitionDuration:
                      isCircleHovered && showCapsuleTitle
                        ? "150ms"
                        : !isCircleHovered
                          ? "0ms"
                          : "200ms",
                  }}
                  aria-hidden={isCircleHovered && showCapsuleTitle}
                >
                  ?
                </span>

                <div
                  className="absolute inset-0 flex min-w-0 items-center overflow-hidden"
                  style={{
                    opacity: isCircleHovered && showCapsuleTitle ? 1 : 0,
                    transitionProperty: "opacity",
                    transitionDuration: isCircleHovered && showCapsuleTitle ? "150ms" : "0ms",
                    pointerEvents: isCircleHovered && showCapsuleTitle ? "auto" : "none",
                  }}
                  aria-hidden={!showCapsuleTitle}
                >
                  <MarqueeText
                    text={content.title}
                    active={isCircleHovered && showCapsuleTitle}
                    className="w-full min-w-0"
                  />
                </div>
              </>
            )}
          </MorphingDialogLayout>
        )}

        <MorphingDialogContainer>
          <MorphingDialogContent className="flex max-h-[min(85vh,calc(100vw/1.618))] w-[min(calc(100vw-2rem),26rem)] flex-col sm:w-[min(calc(100vw-3rem),36rem)] lg:w-[min(calc(100vw-4rem),44rem)]">
            <div className="scrollbar-thin-transparent flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-7 sm:gap-8 sm:p-10 lg:gap-10 lg:p-14">
              <div className="flex flex-col gap-2 sm:gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {eyebrow}
                </p>
                <MorphingDialogTitle className="pr-10 text-2xl leading-tight text-balance sm:pr-14 sm:text-3xl lg:pr-16">
                  {content.title}
                </MorphingDialogTitle>
                <MorphingDialogSubtitle className="pr-10 text-sm text-muted-foreground sm:pr-14 lg:pr-16">
                  {content.subtitle}
                </MorphingDialogSubtitle>
              </div>

              <LightweightMarkdown className="w-full" content={content.expandedMarkdown} />
            </div>
            <MorphingDialogClose />
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </div>
  )
}
