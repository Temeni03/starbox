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

  // Register the service worker unconditionally (regardless of login state) so the app is
  // installable for anonymous visitors too — not just users who've already signed in.
  // Disabled outside production to avoid caching headaches while developing (test via
  // `next build && next start`, or a preview deploy, instead of `next dev`).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Registration can fail (e.g. unsupported browser, blocked storage) — installability
      // and offline support just won't be available; nothing else in the app depends on it.
    })
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!session?.user) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    async function setup() {
      try {
        await navigator.serviceWorker.ready
        const reg = await navigator.serviceWorker.getRegistration('/')
        if (!reg) return

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
