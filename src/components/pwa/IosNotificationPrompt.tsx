'use client'

import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'

export function IosNotificationPrompt({ onEnable, onClose }: { onEnable: () => void; onClose: () => void }) {
  const t = useTranslations('pwa')
  const tCommon = useTranslations('common')

  return (
    <div className="fixed bottom-16 sm:bottom-4 inset-x-0 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-40 bg-white/95 backdrop-blur-md border border-neutral-200 sm:rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center shrink-0">
        <Icon name="notifications_active" size={18} className="text-brand-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-md font-medium text-neutral-800 truncate">{t('iosNotifTitle')}</p>
        <p className="text-label-sm text-neutral-500 truncate">{t('iosNotifDesc')}</p>
      </div>
      <button
        type="button"
        onClick={onEnable}
        className="shrink-0 px-4 h-9 flex items-center bg-brand-primary text-white rounded-full text-label-lg hover:bg-brand-secondary active:scale-95 transition-all"
      >
        {t('iosNotifEnable')}
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={tCommon('close')}
        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition shrink-0"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}
