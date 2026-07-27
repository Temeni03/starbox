'use client'

import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'

export function IosInstallModal({ onClose, onGotIt }: { onClose: () => void; onGotIt: () => void }) {
  const t = useTranslations('pwa')
  const tCommon = useTranslations('common')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
            <Icon name="ios_share" size={20} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-headline-md text-neutral-800">{t('iosTitle')}</h2>
            <p className="text-body-md text-neutral-500 mt-1">{t('iosDesc')}</p>
          </div>
        </div>

        <ol className="space-y-2">
          <li className="flex items-center gap-2 text-body-md text-neutral-700">
            <span className="w-5 h-5 rounded-full bg-brand-container/30 text-brand-secondary text-label-sm font-semibold flex items-center justify-center shrink-0">
              1
            </span>
            {t('iosStep1')}
            <Icon name="ios_share" size={16} className="text-brand-primary" />
          </li>
          <li className="flex items-center gap-2 text-body-md text-neutral-700">
            <span className="w-5 h-5 rounded-full bg-brand-container/30 text-brand-secondary text-label-sm font-semibold flex items-center justify-center shrink-0">
              2
            </span>
            {t('iosStep2')}
            <Icon name="add_to_home_screen" size={16} className="text-brand-primary" />
          </li>
        </ol>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-label-lg text-neutral-600 hover:bg-neutral-50 rounded-lg transition"
          >
            {tCommon('close')}
          </button>
          <button
            type="button"
            onClick={onGotIt}
            className="px-4 py-2 text-label-lg text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}
