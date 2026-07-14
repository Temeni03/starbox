'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Plus, Pencil, EyeOff, Eye, Trash2, Search, MapPin, AlertTriangle, X } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { resolveLocalized } from '@/lib/resolveLocalized'
import type { Locale } from '@/i18n/config'
import type { LocalizedText } from '@/types/localized'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LocationRecord {
  _id: string
  name: LocalizedText
  price: number
  isActive: boolean
}

interface FormState {
  name: LocalizedText
  price: string
}

const EMPTY_FORM: FormState = { name: {}, price: '' }

export default function AdminLocationsPage() {
  const t = useTranslations('adminLocations')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const { data, isLoading, mutate } = useSWR('/api/admin/locations', fetcher)
  const locations: LocationRecord[] = data?.locations ?? []

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<LocationRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<LocationRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) =>
      [l.name.ar, l.name.fr, l.name.en].some((v) => v?.toLowerCase().includes(q))
    )
  }, [locations, search])

  function openAddForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(location: LocationRecord) {
    setEditing(location)
    setForm({ name: { ...location.name }, price: String(location.price) })
    setShowForm(true)
  }

  async function handleSubmit() {
    const name = {
      ar: form.name.ar?.trim() || undefined,
      fr: form.name.fr?.trim() || undefined,
      en: form.name.en?.trim() || undefined,
    }
    const price = Number(form.price)

    if (!name.ar && !name.fr && !name.en) {
      toast.error(t('nameRequired'))
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t('invalidPrice'))
      return
    }

    setSaving(true)
    try {
      const res = await fetch(
        editing ? `/api/admin/locations/${editing._id}` : '/api/admin/locations',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, price }),
        }
      )
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error ?? 'Failed to save location')

      mutate()
      toast.success(editing ? t('locationUpdated') : t('locationAdded'))
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(location: LocationRecord) {
    try {
      await fetch(`/api/admin/locations/${location._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !location.isActive }),
      })
      mutate()
      toast.success(location.isActive ? t('locationHidden') : t('locationActivated'))
    } catch {
      toast.error(t('updateError'))
    }
  }

  async function deleteLocation() {
    if (!locationToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/locations/${locationToDelete._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mutate()
      toast.success(t('locationDeleted'))
      setLocationToDelete(null)
    } catch {
      toast.error(t('deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-secondary transition"
        >
          <Plus size={16} />
          {t('addLocation')}
        </button>
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

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 px-5 py-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/5" />
              </div>
            </div>
          ))
        ) : locations.length === 0 ? (
          <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400">{t('noLocations')}</p>
        ) : filteredLocations.length === 0 ? (
          <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400">{t('noMatch', { query: search })}</p>
        ) : (
          filteredLocations.map((l) => (
            <div key={l._id} className={`bg-white rounded-2xl border border-neutral-200 flex items-center gap-4 p-4 ${!l.isActive ? 'opacity-50' : ''}`}>
              <div className="w-11 h-11 rounded-xl bg-brand-container/20 flex items-center justify-center shrink-0 text-brand-primary">
                <MapPin size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {resolveLocalized(l.name, locale)}
                  </p>
                  {!l.isActive && <span className="text-xs text-neutral-400">{t('hidden')}</span>}
                </div>
                <p className="text-xs text-neutral-400">{l.price.toLocaleString()} MRU</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditForm(l)}
                  className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-brand-light/40 rounded-lg transition"
                  title={tCommon('edit')}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => toggleActive(l)}
                  className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-brand-light/40 rounded-lg transition"
                  title={l.isActive ? t('hide') : t('show')}
                >
                  {l.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => setLocationToDelete(l)}
                  className="p-2 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition"
                  title={tCommon('delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">
                {editing ? t('editLocation') : t('addLocationTitle')}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  {t('nameFr')}
                </label>
                <input
                  type="text"
                  value={form.name.fr ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, fr: e.target.value } }))}
                  placeholder={t('nameFrPlaceholder')}
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  {t('nameAr')}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.name.ar ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, ar: e.target.value } }))}
                  placeholder="مثال: الكصر"
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  {t('nameEn')}
                </label>
                <input
                  type="text"
                  value={form.name.en ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, en: e.target.value } }))}
                  placeholder={t('nameEnPlaceholder')}
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  {t('deliveryPrice')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder={t('pricePlaceholder')}
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition disabled:opacity-50"
              >
                {saving ? t('saving') : editing ? t('saveChanges') : t('add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {locationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-800">{t('deleteTitle')}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {t('deleteConfirm', { name: resolveLocalized(locationToDelete.name, locale) })}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLocationToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={deleteLocation}
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
