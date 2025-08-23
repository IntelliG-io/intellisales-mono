import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'
import SkipLinks from '../src/components/a11y/SkipLinks'
import Header from '../src/components/layout/Header'
import GlobalShortcutHandler from '../src/components/a11y/GlobalShortcutHandler'
import Toaster from '../src/components/ui/toaster'
import Sidebar from '../src/components/layout/Sidebar'
import CommandPalette from '../src/components/layout/CommandPalette'

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { var t = localStorage.getItem('theme'); var d = document.documentElement; d.setAttribute('data-theme', t || 'dark'); } catch (e) {} })();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <SkipLinks />
        <Providers>
          <GlobalShortcutHandler />
          <Header />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <main id="main-content" role="main" tabIndex={-1} className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <footer role="contentinfo" className="border-t border-border bg-background/80 px-6 py-6 text-sm text-muted-foreground">
            <div className="mx-auto max-w-[1400px]">© {new Date().getFullYear()} IntelliSales</div>
          </footer>
          <CommandPalette />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
