'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Plus, Pencil, EyeOff, Eye, Trash2, Search, Gift, AlertTriangle } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { resolveLocalized } from '@/lib/resolveLocalized'
import type { Locale } from '@/i18n/config'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminBoxesPage() {
  const t = useTranslations('adminBoxes')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const { data, isLoading, mutate } = useSWR('/api/admin/boxes', fetcher)
  const boxes = data?.boxes ?? []

  const [search, setSearch] = useState('')
  const [boxToDelete, setBoxToDelete] = useState<{ _id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredBoxes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return boxes
    return boxes.filter((b: any) =>
      [b.name?.ar, b.name?.fr, b.name?.en].some((v) => v?.toLowerCase().includes(q))
    )
  }, [boxes, search])

  const metrics = useMemo(() => {
    const totalValue = boxes.reduce((sum: number, b: any) => sum + b.price, 0)
    const visible = boxes.filter((b: any) => b.isActive).length
    const hidden = boxes.filter((b: any) => !b.isActive).length
    return { total: boxes.length, visible, hidden, totalValue }
  }, [boxes])

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/boxes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      mutate()
      toast.success(current ? t('boxHidden') : t('boxActivated'))
    } catch {
      toast.error(t('updateError'))
    }
  }

  async function deleteBox() {
    if (!boxToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/boxes/${boxToDelete._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mutate()
      toast.success(t('boxDeleted'))
      setBoxToDelete(null)
    } catch {
      toast.error(t('deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/boxes/new"
          className="hidden sm:flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition"
        >
          <Plus size={16} />
          {t('addBox')}
        </Link>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-12 pl-12 pr-4 bg-surface-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition shadow-sm"
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{t('totalBoxes')}</span>
          <span className="text-2xl font-bold text-brand-primary">{metrics.total}</span>
        </div>
        <div className="bg-brand-container/20 p-5 rounded-2xl shadow-sm border border-brand-primary/10 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-brand-secondary uppercase tracking-wider">{t('visible')}</span>
          <span className="text-2xl font-bold text-brand-secondary">{metrics.visible}</span>
        </div>
        <div className="bg-status-pending/10 p-5 rounded-2xl shadow-sm border border-status-pending/20 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-status-pending uppercase tracking-wider">{t('hidden')}</span>
          <span className="text-2xl font-bold text-status-pending">{metrics.hidden}</span>
        </div>
        <div className="bg-danger/10 p-5 rounded-2xl shadow-sm border border-danger/20 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-danger uppercase tracking-wider">{t('totalValue')}</span>
          <span className="text-2xl font-bold text-danger">{metrics.totalValue.toLocaleString()} MRU</span>
        </div>
      </div>

      {/* Box list */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">{t('catalog')}</h2>
        <span className="text-xs text-neutral-400">
          {t('showingCount', { shown: filteredBoxes.length, total: boxes.length })}
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 px-5 py-4 flex gap-3 animate-pulse">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/5" />
              </div>
            </div>
          ))
        ) : boxes.length === 0 ? (
          <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400">{t('noBoxesYet')}</p>
        ) : filteredBoxes.length === 0 ? (
          <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400">{t('noMatch', { query: search })}</p>
        ) : (
          filteredBoxes.map((b: any) => {
            const name = resolveLocalized(b.name, locale)
            const productCount = b.products?.length ?? 0
            return (
              <div
                key={b._id}
                className={`bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 hover:border-brand-primary/40 transition-colors flex items-center gap-4 ${!b.isActive ? 'opacity-50' : ''}`}
              >
                <div className="relative w-16 h-16 rounded-xl bg-surface-high shrink-0 overflow-hidden flex items-center justify-center text-neutral-300">
                  {b.coverImage ? (
                    <Image src={b.coverImage} alt={name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <Gift size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-semibold text-neutral-800 truncate">{name}</h3>
                    <span className="text-sm font-bold text-brand-primary whitespace-nowrap">
                      {b.price.toLocaleString()} MRU
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-neutral-500">
                      {t('productsCount', { count: productCount })}
                    </span>
                    {!b.isActive && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        {t('hiddenBadge')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/boxes/${b._id}/edit`}
                    className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-brand-light/40 rounded-lg transition"
                    title={tCommon('edit')}
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => toggleActive(b._id, b.isActive)}
                    className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-brand-light/40 rounded-lg transition"
                    title={b.isActive ? t('hide') : t('show')}
                  >
                    {b.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => setBoxToDelete({ _id: b._id, name })}
                    className="p-2 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition"
                    title={tCommon('delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Mobile FAB */}
      <Link
        href="/admin/boxes/new"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
        aria-label={t('addBoxAria')}
      >
        <Plus size={26} />
      </Link>

      {boxToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">{t('deleteTitle')}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {t('deleteConfirm', { name: boxToDelete.name })}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBoxToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={deleteBox}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? t('deleting') : tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
