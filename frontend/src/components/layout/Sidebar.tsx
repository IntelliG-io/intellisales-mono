"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { 
  LayoutGrid, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  DollarSign,
  Receipt,
  TrendingUp,
  UserCheck,
  Truck,
  Calculator,
  Archive,
  Percent
} from 'lucide-react'

const links = [
  { 
    category: 'Sales',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutGrid },
      { href: '/pos', label: 'Point of Sale', icon: DollarSign },
      { href: '/sales', label: 'Sales History', icon: Receipt },
      { href: '/discounts', label: 'Discounts', icon: Percent }
    ]
  },
  {
    category: 'Inventory',
    items: [
      { href: '/inventory', label: 'Products', icon: Package },
      { href: '/inventory/stock', label: 'Stock Levels', icon: Archive },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: Truck }
    ]
  },
  {
    category: 'People',
    items: [
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/employees', label: 'Employees', icon: UserCheck }
    ]
  },
  {
    category: 'Analytics',
    items: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
      { href: '/analytics', label: 'Analytics', icon: TrendingUp },
      { href: '/calculator', label: 'Calculator', icon: Calculator }
    ]
  },
  {
    category: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings }
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const listRef = useRef<HTMLUListElement>(null)

  const allLinks = links.flatMap(section => section.items)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ensure the current route item is tabbable
    const items = Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-nav]') ?? [])
    items.forEach((a) => a.setAttribute('tabindex', '-1'))
    const current = items.find((a) => a.getAttribute('data-active') === 'true') ?? items[0]
    current?.setAttribute('tabindex', '0')
  }, [pathname])

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const items = Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-nav]') ?? [])
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
    <aside id="app-sidebar" aria-label="Sidebar" className="w-64 min-h-screen border-r border-border bg-muted/40 p-4 flex flex-col hidden lg:flex">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground px-2">IntelliSales POS</h2>
        <p className="text-xs text-muted-foreground px-2">Point of Sale System</p>
      </div>
      
      <nav ref={navRef} onKeyDown={onKeyDown} aria-label="Primary" className="space-y-4 flex-1 overflow-y-auto">
        {links.map((section) => (
          <div key={section.category}>
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.category}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      data-nav
                      data-active={isActive}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'focus-ring group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 border-l-2',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                    >
                      {Icon ? (
                        <Icon 
                          className={cn(
                            "h-4 w-4 transition-colors", 
                            isActive 
                              ? "text-primary" 
                              : "text-muted-foreground group-hover:text-foreground"
                          )} 
                          aria-hidden="true" 
                        />
                      ) : null}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-border">
        <div className="px-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div>Last sync: 2 mins ago</div>
        </div>
      </div>
    </aside>
  )
}
