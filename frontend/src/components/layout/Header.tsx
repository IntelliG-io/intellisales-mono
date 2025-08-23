"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ThemeToggle } from '../ui/theme-toggle'
import MainNav from './MainNav'
import StoreSelector from './StoreSelector'
import UserMenu from './UserMenu'
import { Button } from '../ui/button'
import { Menu, X } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="focus-ring rounded-md px-2 py-1 text-base font-semibold">
              IntelliSales
            </Link>
            <StoreSelector className="hidden sm:block" />
          </div>
          
          <MainNav className="hidden lg:flex" />
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="hidden sm:flex">Quick Create</Button>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" /> Online
            </span>
            <Label htmlFor="product-search" className="sr-only">
              Search products
            </Label>
            <Input id="product-search" type="search" placeholder="Search..." className="hidden w-32 sm:w-56 md:block" />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open command palette"
              onClick={() => document.dispatchEvent(new CustomEvent('app:command'))}
            >
              <span className="sr-only sm:not-sr-only">Search</span>
              <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">Ctrl+/</kbd>
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-muted/40 border-r border-border p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/pos">Point of Sale</NavLink>
              <NavLink href="/sales">Sales</NavLink>
              <NavLink href="/inventory">Inventory</NavLink>
              <NavLink href="/customers">Customers</NavLink>
              <NavLink href="/reports">Reports</NavLink>
              <NavLink href="/settings">Settings</NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
