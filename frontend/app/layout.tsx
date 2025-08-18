import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'

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
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
