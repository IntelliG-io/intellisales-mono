"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'
import { BarChart3, Package, ShoppingCart, Users, LayoutGrid } from 'lucide-react'

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function MainNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav id="site-nav" aria-label="Main" className={cn("flex items-center gap-1", className)}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
