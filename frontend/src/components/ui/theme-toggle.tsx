"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from './button'

const THEMES: Array<'light' | 'dark' | 'hc'> = ['light', 'dark', 'hc']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const i = Math.max(0, THEMES.indexOf((theme as any) ?? 'light'))
    setIdx(i)
  }, [theme])

  const cycle = () => {
    const next = (idx + 1) % THEMES.length
    setIdx(next)
    setTheme(THEMES[next])
  }

  const label = `Theme: ${THEMES[idx]}`
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={label}
      title={label}
      onClick={cycle}
    >
      {THEMES[idx]}
    </Button>
  )
}

export default ThemeToggle
