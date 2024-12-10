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
    <div className="relative flex h-8 w-40 items-center justify-center rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
      <div
        className="absolute left-1 h-6 w-[calc(33.33%-2px)] rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-700"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      />
      {themes.map(({ name, icon: Icon }) => (
        <button
          key={name}
          className={`relative z-10 flex h-6 w-1/3 items-center justify-center rounded-full text-sm transition-colors ${
            currentTheme === name
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
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

