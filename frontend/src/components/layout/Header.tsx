"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ThemeToggle } from '../ui/theme-toggle'
import MainNav from './MainNav'
import StoreSelector from './StoreSelector'
import UserMenu from './UserMenu'
import { Button } from '../ui/button'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className="focus-ring inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none"
    >
      {children}
    </Link>
  )
}

export default function Header() {
  return (
    <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="focus-ring rounded-md px-2 py-1 text-base font-semibold">
            IntelliSales
          </Link>
          <StoreSelector />
        </div>
        <MainNav />
        <div className="flex items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" /> Online
          </span>
          <Label htmlFor="product-search" className="sr-only">
            Search products
          </Label>
          <Input id="product-search" type="search" placeholder="Search products..." className="hidden w-56 md:block" />
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open command palette"
            onClick={() => document.dispatchEvent(new CustomEvent('app:command'))}
          >
            Search
            <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">Ctrl+/</kbd>
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
