'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { HEARTBEAT_INTERVAL_MS } from '@/lib/presence'

/**
 * Keeps `lastActiveAt` fresh for the signed-in user so the admin panel can show who is online
 * right now. Pings on mount, then once per HEARTBEAT_INTERVAL_MS, but only while the tab is
 * visible — a phone with the screen off or the app in the background is not "active", and
 * skipping those pings is what makes the count mean something.
 */
export function PresenceHeartbeat() {
  const { status } = useSession()
  const authenticated = status === 'authenticated'

  useEffect(() => {
    if (!authenticated) return

    let cancelled = false

    const ping = () => {
      if (cancelled || document.visibilityState !== 'visible') return
      // Fire and forget: a dropped heartbeat only means the user looks idle for a few minutes.
      fetch('/api/presence', { method: 'POST', keepalive: true }).catch(() => {})
    }

    ping()
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS)
    // Coming back to the foreground should register immediately, not at the next tick.
    document.addEventListener('visibilitychange', ping)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', ping)
    }
  }, [authenticated])

  return null
}
