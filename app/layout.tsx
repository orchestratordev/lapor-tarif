import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600']
})

export const metadata: Metadata = {
  title: 'Lapor Tarif — DOKB Kalimantan Selatan',
  description: 'Platform pelaporan pelanggaran tarif ASK Kalimantan Selatan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
