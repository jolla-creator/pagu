import { Inter } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Pagù — Ordina e paga al tavolo',
  description: 'Il modo più veloce per ordinare al ristorante. Scansiona il QR, ordina e paga dal telefono.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={inter.className}>
      <body className="bg-white text-neutral-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
