'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground mt-2">
          An error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}