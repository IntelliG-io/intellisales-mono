"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="focus-ring rounded-md px-2 py-1 text-base font-semibold">
            IntelliSales
          </Link>
        </div>
        <nav id="site-nav" aria-label="Main" className="flex items-center gap-1">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/login">Login</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            placeholder="Search products..."
            className="focus-ring h-9 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </header>
  )
}
