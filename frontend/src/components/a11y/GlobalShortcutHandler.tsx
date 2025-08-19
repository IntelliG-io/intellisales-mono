"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Global keyboard shortcuts for fast POS navigation.
 * - Navigation: Ctrl+Shift+D/S/I/C/R
 * - Actions: Ctrl+N, Ctrl+S, Ctrl+F, Esc, F1
 * Emits CustomEvents for save/cancel so pages can subscribe without tight coupling.
 */
export default function GlobalShortcutHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Avoid interfering with text inputs except search focusing
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable

      // Helper to navigate only if not already on path
      const go = (path: string) => {
        if (pathname !== path) router.push(path)
      }

      // Global navigation shortcuts (Ctrl+Shift+Key)
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'd': // Dashboard
            e.preventDefault()
            go('/')
            return
          case 's': // Sales interface
            e.preventDefault()
            go('/sales')
            return
          case 'i': // Inventory
            e.preventDefault()
            go('/inventory')
            return
          case 'c': // Customers
            e.preventDefault()
            go('/customers')
            return
          case 'r': // Reports
            e.preventDefault()
            go('/reports')
            return
        }
      }

      // Actions
      if (e.ctrlKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'd': // Focus dashboard overview
            e.preventDefault()
            if (pathname !== '/') {
              go('/')
              // allow navigation, focusing will occur after route change naturally when user interacts
              return
            }
            {
              const section = document.getElementById('section-1')
              if (section) {
                if (!section.getAttribute('tabindex')) section.setAttribute('tabindex', '-1')
                ;(section as HTMLElement).focus({ preventScroll: true })
                section.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }
            return
          case 'n': // New transaction
            e.preventDefault()
            go('/sales?new=1')
            return
          case 's': // Save
            e.preventDefault()
            document.dispatchEvent(new CustomEvent('app:save'))
            return
          case 'f': // Focus product search
            e.preventDefault()
            const el = document.getElementById('product-search') as HTMLInputElement | null
            if (el) el.focus()
            return
          case '/': // Open command palette
            e.preventDefault()
            document.dispatchEvent(new CustomEvent('app:command'))
            return
        }
      }

      // Context-free keys
      // Quick jumps: number keys to sections on Dashboard (1-4)
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (pathname === '/' && ['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault()
          const id = `section-${e.key}`
          const el = document.getElementById(id)
          if (el) {
            if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '-1')
            ;(el as HTMLElement).focus({ preventScroll: true })
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          return
        }
      }

      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('app:cancel'))
        return
      }
      if (e.key === 'F1') {
        e.preventDefault()
        go('/help')
        return
      }

      // Avoid consuming keys while typing
      if (isTyping) return
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, pathname])

  return null
}
