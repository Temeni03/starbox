'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import NextTopLoader from 'nextjs-toploader'
import { PushNotificationSetup } from '@/components/PushNotificationSetup'

export function Providers({ children }: { children: React.ReactNode }) {
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
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </SessionProvider>
  )
}
