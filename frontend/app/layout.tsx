import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'
import SkipLinks from '../src/components/a11y/SkipLinks'
import Header from '../src/components/layout/Header'
import GlobalShortcutHandler from '../src/components/a11y/GlobalShortcutHandler'

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
          <main id="main-content" role="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-4">
            {children}
          </main>
          <footer role="contentinfo" className="border-t border-border bg-background/80 px-4 py-6 text-sm text-muted-foreground">
            <div className="mx-auto max-w-7xl">© {new Date().getFullYear()} IntelliSales</div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
