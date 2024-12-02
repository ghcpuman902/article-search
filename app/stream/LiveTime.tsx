'use client'

import React, { useEffect, useState } from 'react'

export default function LiveTime() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Initial set
    setTime(new Date().toLocaleString())
    // Update every second
    const timer = setInterval(() => {
      setTime(new Date().toLocaleString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Suppress hydration warning by not rendering until client-side
  if (!time) return null

  return <p className="text-sm text-gray-500">Current time: {time}</p>
}
