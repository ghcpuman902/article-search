'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ComponentProps } from 'react'
import { useRouter } from 'next/navigation'

interface PaginationButtonProps extends ComponentProps<typeof Link> {
  isActive?: boolean
  disabled?: boolean
}

export function PaginationButton({ href, children, isActive, disabled, ...props }: PaginationButtonProps) {
  const router = useRouter()

  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled>
        <div>{children}</div>
      </Button>
    )
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push(href.toString(), { scroll: true })
  }

  return (
    <Button 
      variant={isActive ? "default" : "outline"} 
      size="icon" 
      asChild
    >
      <Link 
        href={href} 
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    </Button>
  )
} 