'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase-client'

export function PushNotificationSetup() {
  const { data: session } = useSession()

  // Register the caching service worker unconditionally (regardless of login state) so the app is
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

  // Once logged in: request notification permission, get an FCM token, and save it on the
  // user. Also listen for foreground pushes — shown as a toast instead of an OS notification,
  // since the service worker's background handler would otherwise double-notify a user who
  // already has the app open.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!session?.user) return
    if (!('serviceWorker' in navigator)) return

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) return

    let unsubscribe: (() => void) | undefined

    async function setup() {
      try {
        const messaging = await getFirebaseMessaging()
        if (!messaging) return

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.data?.title ?? 'StarBox'
          const body = payload.data?.body ?? ''
          toast(body ? `${title} — ${body}` : title)
        })

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // Registered at a dedicated scope (distinct from /sw.js at '/') so the two
        // service workers coexist instead of one replacing the other's control.
        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope',
        })

        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg })
        if (!token) return

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
      } catch {
        // Silently fail — push is optional
      }
    }

    setup()
    return () => unsubscribe?.()
  }, [session?.user?.id])

  return null
}
