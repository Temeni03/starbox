'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export function PushNotificationSetup() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        await navigator.serviceWorker.ready

        const existing = await reg.pushManager.getSubscription()
        if (existing) return // Already subscribed

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey!) as unknown as ArrayBuffer,
        })

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      } catch {
        // Silently fail — push is optional
      }
    }

    setup()
  }, [session?.user?.id])

  return null
}
