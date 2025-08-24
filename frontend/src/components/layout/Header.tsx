"use client"

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ThemeToggle } from '../ui/theme-toggle'

import MainNav from './MainNav'
import StoreSelector from './StoreSelector'
import UserMenu from './UserMenu'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`focus-ring flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none ${
        isActive 
          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
          : 'text-foreground hover:bg-muted/60 hover:text-foreground border-l-2 border-transparent'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <div className="flex items-center gap-3">
              <Link href="/" className="focus-ring rounded-md px-2 py-1 text-lg font-bold text-primary">
                IntelliSales
              </Link>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <StoreSelector className="hidden sm:block" />
            </div>
          </div>
          
          {/* Center section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Label htmlFor="product-search" className="sr-only">
                Search products
              </Label>
              <Input 
                id="product-search" 
                type="search" 
                placeholder="Search products, customers..." 
                className="w-full pl-4 pr-12" 
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2"
                aria-label="Open command palette"
                onClick={() => document.dispatchEvent(new CustomEvent('app:command'))}
              >
                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
              </Button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Quick actions - only on larger screens */}
            <div className="hidden xl:flex items-center gap-2 mr-2">
              <Button size="sm" variant="outline">
                New Sale
              </Button>
              <div className="h-6 w-px bg-border" />
            </div>
            
            {/* Status indicator */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>

            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              aria-label="Search"
              onClick={() => document.dispatchEvent(new CustomEvent('app:command'))}
            >
              <span className="sr-only">Search</span>
              🔍
            </Button>

            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">Navigation</h2>
                <p className="text-xs text-muted-foreground">IntelliSales POS</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <Input placeholder="Search..." className="w-full" />
              </div>
              
              <nav className="space-y-2">
                <div className="space-y-1">
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Quick Actions
                  </h3>
                  <NavLink href="/pos">🛒 Point of Sale</NavLink>
                  <NavLink href="/inventory">📦 Add Product</NavLink>
                  <NavLink href="/customers">👥 New Customer</NavLink>
                </div>
                
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Main Menu
                  </h3>
                  <div className="space-y-1">
                    <NavLink href="/">📊 Dashboard</NavLink>
                    <NavLink href="/sales">💰 Sales</NavLink>
                    <NavLink href="/inventory">📦 Inventory</NavLink>
                    <NavLink href="/customers">👥 Customers</NavLink>
                    <NavLink href="/reports">📈 Reports</NavLink>
                    <NavLink href="/settings">⚙️ Settings</NavLink>
                  </div>
                </div>
              </nav>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span>System Online</span>
                </div>
                <StoreSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
