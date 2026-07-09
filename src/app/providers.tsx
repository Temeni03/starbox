'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import NextTopLoader from 'nextjs-toploader'
import { useLocale } from 'next-intl'
import { isRtl, type Locale } from '@/i18n/config'
import { PushNotificationSetup } from '@/components/PushNotificationSetup'

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale

  return (
    <SessionProvider>
      <NextTopLoader color="#1B4332" height={3} showSpinner={false} />
      <PushNotificationSetup />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: isRtl(locale)
              ? 'var(--font-cairo), system-ui, sans-serif'
              : 'var(--font-inter), system-ui, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </SessionProvider>
  )
}
