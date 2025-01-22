'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'


interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <Link
        href="/"
        onClick={(e) => {
          e.preventDefault()
          window.location.reload()
        }}
        className="text-blue-500 hover:text-blue-700 underline"
      >
        Try again
      </Link>
    </div>
  )
}