"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react"
import { XIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type MorphingTransition = {
  type?: "spring" | "tween"
  bounce?: number
  duration?: number
  ease?: readonly number[] | string
}

const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const
const EASE_OUT = [0.23, 1, 0.32, 1] as const

const defaultTransition: MorphingTransition = {
  type: "tween",
  duration: 0.28,
  ease: EASE_IN_OUT,
}

const resolveLayoutTransition = (
  transition: MorphingTransition,
  shouldReduceMotion: boolean | null
) => {
  if (shouldReduceMotion) return { duration: 0 }

  if (transition.type === "spring") {
    return {
      type: "spring" as const,
      bounce: transition.bounce ?? 0,
      duration: transition.duration ?? 0.28,
    }
  }

  return {
    duration: transition.duration ?? 0.28,
    ease: (transition.ease ?? EASE_IN_OUT) as [number, number, number, number],
  }
}

type MorphingDialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  layoutId: string
  transition: MorphingTransition
}

const MorphingDialogContext = React.createContext<MorphingDialogContextValue | null>(null)

const useMorphingDialog = () => {
  const context = React.useContext(MorphingDialogContext)
  if (!context) {
    throw new Error("MorphingDialog components must be used inside MorphingDialog.")
  }
  return context
}

type MorphingDialogProps = {
  children: React.ReactNode
  transition?: MorphingTransition
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const MorphingDialog = ({
  children,
  transition = defaultTransition,
  open: openProp,
  onOpenChange,
}: MorphingDialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const layoutId = React.useId().replace(/:/g, "")
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const value = React.useMemo(
    () => ({ open, setOpen, layoutId, transition }),
    [open, setOpen, layoutId, transition]
  )

  return (
    <MorphingDialogContext.Provider value={value}>
      <LayoutGroup id={layoutId}>{children}</LayoutGroup>
    </MorphingDialogContext.Provider>
  )
}

function MorphingDialogLayout({
  className,
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  "aria-label": ariaLabel,
}: Pick<
  HTMLMotionProps<"div">,
  | "className"
  | "style"
  | "children"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onClick"
  | "onKeyDown"
  | "role"
  | "tabIndex"
  | "aria-label"
>) {
  const { open, layoutId, transition } = useMorphingDialog()
  const shouldReduceMotion = useReducedMotion()

  if (open) return null

  return (
    <motion.div
      layoutId={layoutId}
      layout
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      transition={resolveLayoutTransition(transition, shouldReduceMotion)}
    >
      {children}
    </motion.div>
  )
}

function MorphingDialogTrigger({
  className,
  style,
  onClick,
  children,
  ...props
}: HTMLMotionProps<"button">) {
  const { open, setOpen, layoutId, transition } = useMorphingDialog()
  const shouldReduceMotion = useReducedMotion()

  if (open) return null

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    setOpen(true)
  }

  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      layout
      aria-haspopup="dialog"
      aria-expanded={open}
      className={className}
      style={style}
      transition={resolveLayoutTransition(transition, shouldReduceMotion)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  )
}

const useIsClient = () =>
  React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

function MorphingDialogContainer({ children }: { children: React.ReactNode }) {
  const { open } = useMorphingDialog()
  const isClient = useIsClient()

  if (!isClient) return null

  return createPortal(
    <AnimatePresence mode="popLayout">{open ? children : null}</AnimatePresence>,
    document.body
  )
}

function MorphingDialogContent({
  className,
  style,
  children,
}: Pick<HTMLMotionProps<"div">, "className" | "style" | "children"> & {
  showCloseButton?: boolean
}) {
  const { open, setOpen, layoutId, transition } = useMorphingDialog()
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  const layoutTransition = resolveLayoutTransition(transition, shouldReduceMotion)

  return (
    <>
      <motion.button
        key="morphing-dialog-backdrop"
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 z-50 cursor-default bg-black/10 backdrop-blur-sm"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.18, ease: EASE_OUT as [number, number, number, number] }
        }
        onClick={() => setOpen(false)}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          key="morphing-dialog-panel"
          role="dialog"
          aria-modal="true"
          layoutId={layoutId}
          layout
          layoutRoot
          data-slot="morphing-dialog-content"
          className={cn(
            "pointer-events-auto relative flex w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background text-sm shadow-lg ring-1 ring-foreground/10 outline-none",
            className
          )}
          style={style}
          transition={layoutTransition}
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}

function MorphingDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-base leading-none font-medium", className)} {...props} />
}

function MorphingDialogSubtitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={className} {...props} />
}

function MorphingDialogDescription({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  disableLayoutAnimation?: boolean
  variants?: unknown
}) {
  return (
    <div
      data-slot="morphing-dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function MorphingDialogImage({
  className,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  return <img className={className} alt={alt} {...props} />
}

function MorphingDialogClose({ className }: { className?: string }) {
  const { setOpen } = useMorphingDialog()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("absolute top-2 right-2", className)}
      onClick={() => setOpen(false)}
      aria-label="Close dialog"
    >
      <XIcon aria-hidden="true" />
    </Button>
  )
}

export {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogLayout,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
}
