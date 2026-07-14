import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Manrope, Cairo } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { isRtl, type Locale } from '@/i18n/config'
import { Providers } from './providers'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
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
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} className={`${plusJakartaSans.variable} ${manrope.variable} ${cairo.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
