import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { isRtl, type Locale } from '@/i18n/config'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'StarBox',
    template: '%s | StarBox',
  },
  description: 'Order products and get them delivered to your door.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StarBox',
  },
}

export const viewport: Viewport = {
  themeColor: '#9731B9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = (await getLocale()) as Locale

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
