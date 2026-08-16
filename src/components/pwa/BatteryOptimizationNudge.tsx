'use client'

import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { openBatterySettings } from '@/lib/pwa/batteryNudge'

export function BatteryOptimizationNudge({ onClose }: { onClose: () => void }) {
  const t = useTranslations('pwa')
  const tCommon = useTranslations('common')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
            <Icon name="battery_alert" size={20} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-headline-md text-neutral-800">{t('batteryTitle')}</h2>
            <p className="text-body-md text-neutral-500 mt-1">{t('batteryDesc')}</p>
          </div>
        </div>

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
            onClick={() => {
              openBatterySettings()
              onClose()
            }}
            className="px-4 py-2 text-label-lg text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition"
          >
            {t('batteryOpenSettings')}
          </button>
        </div>
      </div>
    </div>
  )
}
