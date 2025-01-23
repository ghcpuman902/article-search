'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Laptop } from 'lucide-react'

const themes = [
  { name: 'light', icon: Sun },
  { name: 'system', icon: Laptop },
  { name: 'dark', icon: Moon },
]

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = theme || 'system'
  const currentIndex = themes.findIndex(t => t.name === currentTheme)

  return (
    <div className="relative flex h-8 w-40 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 p-1">
      <div
        className="absolute left-1 h-6 w-[calc(33.33%-2px)] rounded-full border border-zinc-300 dark:border-zinc-700 transition-transform"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      />
      {themes.map(({ name, icon: Icon }) => (
        <button
          key={name}
          className={`relative z-10 flex h-6 w-1/3 items-center justify-center rounded-full text-sm transition-colors ${
            currentTheme === name
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
          }`}
          onClick={() => setTheme(name)}
          aria-label={`Switch to ${name} theme`}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{name} mode</span>
        </button>
      ))}
    </div>
  )
}

