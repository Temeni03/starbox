'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { PushNotificationSetup } from '@/components/PushNotificationSetup'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
