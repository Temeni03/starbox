'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { usePwaInstall } from '@/lib/pwa/InstallPromptContext'
import { isDismissed, setDismissed } from '@/lib/pwa/dismissal'
import { IosInstallModal } from './IosInstallModal'

// Tweak these to change when the prompt shows and how long a dismissal is respected.
const ENGAGEMENT_CONFIG = {
  /** Show once the user reaches this page view count in the current tab session. */
  minPageViews: 2,
  /** ...or once they land on a product page, regardless of view count. */
  productPathPrefix: '/products/',
  /** ...or after this many ms, whichever comes first. */
  delayMs: 30_000,
  /** After a temporary dismissal ("×"), wait this many days before showing again. */
  snoozeDays: 14,
}

/** Routes where the prompt should never appear, even if engagement conditions are met. */
const EXCLUDED_ROUTE_PREFIXES = ['/checkout']

const PAGE_VIEW_STORAGE_KEY = 'starbox:pv-count'

export function InstallPrompt() {
  const t = useTranslations('pwa')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { mounted, platform, canPromptInstall, promptInstall } = usePwaInstall()

  const [engaged, setEngaged] = useState(false)
  const [closed, setClosed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Engagement trigger: 2nd page view, OR a product page view, OR a delay — whichever comes first.
  useEffect(() => {
    let count = 0
    try {
      count = Number(window.sessionStorage.getItem(PAGE_VIEW_STORAGE_KEY) ?? '0') + 1
      window.sessionStorage.setItem(PAGE_VIEW_STORAGE_KEY, String(count))
    } catch {
      count = 1
    }

    if (count >= ENGAGEMENT_CONFIG.minPageViews || pathname?.startsWith(ENGAGEMENT_CONFIG.productPathPrefix)) {
      setEngaged(true)
      return
    }

    timerRef.current = setTimeout(() => setEngaged(true), ENGAGEMENT_CONFIG.delayMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // Intentionally only re-checks the trigger on route change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const dismiss = useCallback((permanent: boolean) => {
    setDismissed(permanent)
    setClosed(true)
  }, [])

  const handleInstallClick = useCallback(async () => {
    await promptInstall()
    dismiss(true)
  }, [promptInstall, dismiss])

  if (!mounted) return null
  if (platform.isStandalone) return null
  if (closed) return null
  if (isDismissed(ENGAGEMENT_CONFIG.snoozeDays)) return null
  if (!engaged) return null
  if (EXCLUDED_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null

  // iOS, but not Safari — in-app browsers (Instagram/TikTok/etc.) and other iOS browsers
  // (Chrome/Firefox-for-iOS) can't trigger "Add to Home Screen" at all.
  if (platform.isIOS && !platform.isSafari) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 inset-x-0 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-40 bg-white/95 backdrop-blur-md border border-neutral-200 sm:rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center shrink-0">
          <Icon name="open_in_browser" size={18} className="text-brand-primary" />
        </div>
        <p className="flex-1 text-body-md text-neutral-700">{t('openInSafari')}</p>
        <button
          type="button"
          onClick={() => dismiss(false)}
          aria-label={tCommon('close')}
          className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition shrink-0"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    )
  }

  // iOS Safari — no programmatic install trigger exists; walk the user through the Share sheet.
  if (platform.isIOS && platform.isSafari) {
    return <IosInstallModal onClose={() => dismiss(false)} onGotIt={() => dismiss(true)} />
  }

  // Android / Chrome / Edge / Desktop Chrome — only show once the browser has actually offered install.
  if (canPromptInstall) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 inset-x-0 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-40 bg-white/95 backdrop-blur-md border border-neutral-200 sm:rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <Image src="/logo.jpg" alt="" width={36} height={36} className="rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body-md font-medium text-neutral-800 truncate">{t('installTitle')}</p>
          <p className="text-label-sm text-neutral-500 truncate">{t('installDesc')}</p>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 px-4 h-9 flex items-center bg-brand-primary text-white rounded-full text-label-lg hover:bg-brand-secondary active:scale-95 transition-all"
        >
          {t('installButton')}
        </button>
        <button
          type="button"
          onClick={() => dismiss(false)}
          aria-label={tCommon('close')}
          className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition shrink-0"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    )
  }

  return null
}
