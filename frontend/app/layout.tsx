import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'IntelliSales',
  description: 'POS frontend',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
