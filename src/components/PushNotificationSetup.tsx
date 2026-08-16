'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { getToken, onMessage, type Messaging } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/lib/firebase-client'
import { getPlatformInfo } from '@/lib/pwa/platform'
import { hasBatteryNudgeBeenSeen, markBatteryNudgeSeen } from '@/lib/pwa/batteryNudge'
import { BatteryOptimizationNudge } from '@/components/pwa/BatteryOptimizationNudge'
import { IosNotificationPrompt } from '@/components/pwa/IosNotificationPrompt'

export function PushNotificationSetup() {
  const { data: session } = useSession()
  const [showBatteryNudge, setShowBatteryNudge] = useState(false)
  const [showIosPrompt, setShowIosPrompt] = useState(false)

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

  // Assumes Notification permission is already granted. Registers the FCM service worker
  // (separate scope from /sw.js so the two coexist), gets a token, and saves it.
  const registerToken = useCallback(async (messaging: Messaging) => {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) return

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

    // Android background-delivery reliability depends on the OS not freezing the app —
    // nudge the user toward exempting it from battery optimization, once, on Android only.
    if (getPlatformInfo().isAndroid && !hasBatteryNudgeBeenSeen()) {
      setShowBatteryNudge(true)
    }
  }, [])

  // Once logged in: request notification permission, get an FCM token, and save it on the
  // user. Also listen for foreground pushes — shown as a toast instead of an OS notification,
  // since the service worker's background handler would otherwise double-notify a user who
  // already has the app open.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!session?.user) return
    if (!('serviceWorker' in navigator)) return
    if (!('Notification' in window)) return
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return

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

        const { isIOS, isStandalone } = getPlatformInfo()

        // WebKit only supports web push for a home-screen-installed app, and only allows
        // Notification.requestPermission() when called directly inside a user gesture —
        // calling it automatically here (no gesture) is silently ignored on iOS. Permission
        // already granted from an earlier tap can proceed automatically; otherwise show a
        // tappable prompt instead of requesting permission ourselves.
        if (isIOS) {
          if (!isStandalone) return
          if (Notification.permission === 'granted') {
            await registerToken(messaging)
          } else if (Notification.permission === 'default') {
            setShowIosPrompt(true)
          }
          return
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return
        await registerToken(messaging)
      } catch {
        // Silently fail — push is optional
      }
    }

    setup()
    return () => unsubscribe?.()
  }, [session?.user?.id, registerToken])

  const handleEnableIosNotifications = useCallback(async () => {
    setShowIosPrompt(false)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const messaging = await getFirebaseMessaging()
      if (!messaging) return
      await registerToken(messaging)
    } catch {
      // Silently fail — push is optional
    }
  }, [registerToken])

  if (showIosPrompt) {
    return <IosNotificationPrompt onEnable={handleEnableIosNotifications} onClose={() => setShowIosPrompt(false)} />
  }

  if (showBatteryNudge) {
    return (
      <BatteryOptimizationNudge
        onClose={() => {
          markBatteryNudgeSeen()
          setShowBatteryNudge(false)
        }}
      />
    )
  }

  return null
}
