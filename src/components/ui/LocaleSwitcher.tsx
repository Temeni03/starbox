'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { setUserLocale } from '@/i18n/actions'

export function LocaleSwitcher({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const t = useTranslations('common')
  const locale = useLocale() as Locale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleSelect(next: Locale) {
    setOpen(false)
    if (next === locale) return
    startTransition(async () => {
      await setUserLocale(next)
      router.refresh()
    })
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        title={compact ? localeNames[locale] : undefined}
        className={`inline-flex items-center rounded-full font-medium text-neutral-600 hover:bg-surface-high active:scale-95 disabled:opacity-50 transition-all ${
          compact ? 'w-10 h-10 justify-center' : 'gap-1.5 px-2 py-1.5 text-sm'
        }`}
      >
        <Languages size={compact ? 20 : 16} className={`text-neutral-400 transition-transform duration-300 ${isPending ? 'animate-pulse' : ''}`} />
        {!compact && <span>{localeNames[locale]}</span>}
        {!compact && (
          <ChevronDown
            size={14}
            className={`text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      <div
        role="listbox"
        className={`absolute end-0 top-full mt-2 w-40 origin-top rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-900/5 p-1 z-50 transition-all duration-150 ease-out ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
      >
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="option"
            aria-selected={l === locale}
            onClick={() => handleSelect(l)}
            className={`flex w-full items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              l === locale
                ? 'bg-brand-light/60 text-brand-primary font-semibold'
                : 'text-neutral-600 hover:bg-surface-high'
            }`}
          >
            {localeNames[l]}
            {l === locale && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  )
}
