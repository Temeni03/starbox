'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Icon } from '@/components/ui/Icon'
import { usePwaInstall } from '@/lib/pwa/InstallPromptContext'
import { setDismissed } from '@/lib/pwa/dismissal'
import { IosInstallModal } from './IosInstallModal'

/** Explicit "install the app" entry point for settings/profile screens — hidden once already installed. */
export function DownloadAppButton({ className = '' }: { className?: string }) {
  const t = useTranslations('pwa')
  const { mounted, platform, canPromptInstall, promptInstall } = usePwaInstall()
  const [showIosModal, setShowIosModal] = useState(false)

  if (!mounted || platform.isStandalone) return null

  async function handleClick() {
    if (platform.isIOS && platform.isSafari) {
      setShowIosModal(true)
      return
    }
    if (platform.isIOS && !platform.isSafari) {
      toast(t('openInSafari'))
      return
    }
    if (canPromptInstall) {
      const outcome = await promptInstall()
      if (outcome === 'accepted') setDismissed(true)
      return
    }
    toast(t('installUnavailable'))
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full h-12 flex items-center justify-center gap-2 border-2 border-brand-primary/20 text-brand-primary rounded-full text-label-lg hover:bg-brand-light transition ${className}`}
      >
        <Icon name="install_mobile" size={18} />
        {t('downloadApp')}
      </button>

      {showIosModal && (
        <IosInstallModal
          onClose={() => setShowIosModal(false)}
          onGotIt={() => {
            setDismissed(true)
            setShowIosModal(false)
          }}
        />
      )}
    </>
  )
}
