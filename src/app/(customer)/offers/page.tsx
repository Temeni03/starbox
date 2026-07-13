'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Gift } from 'lucide-react'
import { useBoxes } from '@/hooks/useBoxes'
import { BoxCard } from '@/components/ui/BoxCard'

export default function OffersPage() {
  const t = useTranslations('offers')
  const { boxes, isLoading } = useBoxes()

  return (
    <div className="pb-20 sm:pb-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition mb-4">
        <ArrowLeft size={16} /> {t('backToShop')}
      </Link>

      <h1 className="text-2xl font-bold text-neutral-800 mb-1">{t('title')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('subtitle')}</p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="aspect-[4/5] rounded-2xl bg-surface-high mb-3" />
              <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-high rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : boxes.length === 0 ? (
        <div className="relative text-center py-12 px-4">
          <div className="relative inline-block mb-8">
            <div className="w-48 h-48 mx-auto rounded-full bg-white/60 backdrop-blur-md border border-brand-light flex items-center justify-center shadow-sm">
              <Gift size={64} className="text-brand-primary/40" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-brand-container/40 blur-xl" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">{t('noOffersAvailable')}</h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">{t('checkBackSoon')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {boxes.map((box) => (
            <BoxCard key={box._id} box={box} />
          ))}
        </div>
      )}
    </div>
  )
}
