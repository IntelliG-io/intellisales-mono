import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'
import SkipLinks from '../src/components/a11y/SkipLinks'
import Header from '../src/components/layout/Header'
import GlobalShortcutHandler from '../src/components/a11y/GlobalShortcutHandler'
import Toaster from '../src/components/ui/toaster'
import Sidebar from '../src/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'IntelliSales',
    template: '%s | IntelliSales',
  },
  description: 'POS frontend',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: typeof window === 'undefined' ? new URL('http://localhost:3000') : undefined,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <SkipLinks />
        <Providers>
          <GlobalShortcutHandler />
          <Header />
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
              <Sidebar />
              <main id="main-content" role="main" tabIndex={-1} className="min-w-0">
                {children}
              </main>
            </div>
          </div>
          <footer role="contentinfo" className="border-t border-border bg-background/80 px-4 py-6 text-sm text-muted-foreground">
            <div className="mx-auto max-w-7xl">© {new Date().getFullYear()} IntelliSales</div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
