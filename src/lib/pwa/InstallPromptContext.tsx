'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getPlatformInfo, type PlatformInfo } from './platform'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

interface PwaInstallContextValue {
  mounted: boolean
  platform: PlatformInfo
  /** True once Chrome/Edge/Android has signaled the app is installable via the native prompt. */
  canPromptInstall: boolean
  /** Triggers the native install prompt. Resolves to the user's choice, or null if unavailable. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | null>
}

const EMPTY_PLATFORM: PlatformInfo = {
  isIOS: false,
  isSafari: false,
  isAndroid: false,
  isStandalone: false,
  isInAppBrowser: false,
}

const PwaInstallContext = createContext<PwaInstallContextValue>({
  mounted: false,
  platform: EMPTY_PLATFORM,
  canPromptInstall: false,
  promptInstall: async () => null,
})

/**
 * Captures the browser's `beforeinstallprompt` event once at the app root so it can be
 * replayed from anywhere (the install banner, a "Download app" row in settings, etc.) —
 * the event only fires once per session, so any listener mounted after the fact would miss it.
 */
export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [platform, setPlatform] = useState<PlatformInfo>(EMPTY_PLATFORM)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setMounted(true)
    setPlatform(getPlatformInfo())
  }, [])

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() {
      setDeferredPrompt(null)
      setPlatform((p) => ({ ...p, isStandalone: true }))
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      return outcome
    } catch {
      // Some browsers throw if the prompt was already consumed — safe to ignore.
      return null
    } finally {
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  return (
    <PwaInstallContext.Provider
      value={{ mounted, platform, canPromptInstall: deferredPrompt !== null, promptInstall }}
    >
      {children}
    </PwaInstallContext.Provider>
  )
}

export function usePwaInstall() {
  return useContext(PwaInstallContext)
}
