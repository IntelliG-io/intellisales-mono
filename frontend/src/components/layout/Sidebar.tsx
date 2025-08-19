"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { LayoutGrid, ShoppingCart, Package, Users, Truck, BarChart3, Settings } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/purchase-orders', label: 'Purchase Orders', icon: Truck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
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
            const Icon = l.icon
            return (
              <li key={l.href}>
                <Link
                  data-nav
                  data-active={isActive}
                  href={l.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'focus-ring group flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors border-l-2',
                    isActive
                      ? 'border-primary bg-muted/60 font-medium'
                      : 'border-transparent text-foreground hover:bg-muted'
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4 text-muted-foreground group-data-[active=true]:text-foreground" aria-hidden="true" /> : null}
                  <span>{l.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
