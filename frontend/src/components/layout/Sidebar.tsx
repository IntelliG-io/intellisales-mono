"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/sales', label: 'Sales' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/customers', label: 'Customers' },
  { href: '/reports', label: 'Reports' },
  { href: '/help', label: 'Help' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    // Ensure the current route item is tabbable
    const items = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-nav]') ?? [])
    items.forEach((a) => a.setAttribute('tabindex', '-1'))
    const current = items.find((a) => a.getAttribute('data-active') === 'true') ?? items[0]
    current?.setAttribute('tabindex', '0')
  }, [pathname])

  const onKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const items = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-nav]') ?? [])
    const currentIndex = items.findIndex((el) => el === document.activeElement)

    let nextIndex = currentIndex
    if (e.key === 'ArrowDown') nextIndex = Math.min(items.length - 1, currentIndex + 1)
    if (e.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1)
    if (e.key === 'Home') nextIndex = 0
    if (e.key === 'End') nextIndex = items.length - 1

    items.forEach((a) => a.setAttribute('tabindex', '-1'))
    const next = items[nextIndex]
    next?.setAttribute('tabindex', '0')
    next?.focus()
  }

  return (
    <aside id="app-sidebar" aria-label="Sidebar" className="rounded-lg border border-border bg-background p-2">
      <nav aria-label="Primary" className="">
        <ul ref={listRef} onKeyDown={onKeyDown} className="flex flex-col gap-1">
          {links.map((l) => {
            const isActive = pathname === l.href
            return (
              <li key={l.href}>
                <Link
                  data-nav
                  data-active={isActive}
                  href={l.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'focus-ring block rounded-md px-3 py-2 text-sm outline-none',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  )}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
