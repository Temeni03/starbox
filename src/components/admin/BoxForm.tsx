'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle, Save, Trash2, Search, Package, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { useBlobUpload } from '@/hooks/useBlobUpload'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { resolveLocalized } from '@/lib/resolveLocalized'
import type { LocalizedText } from '@/types/localized'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface BoxProductSelection {
  product: string
  quantity: string
}

interface BoxFormData {
  name: LocalizedText
  price: string
  coverImage: string
  startDate: string
  endDate: string
  products: BoxProductSelection[]
  isActive: boolean
}

interface Props {
  initialData?: Partial<BoxFormData>
  onSubmit: (data: BoxFormData) => Promise<void>
  onDelete?: () => Promise<void>
  submitLabel: string
}

export function BoxForm({ initialData, onSubmit, onDelete, submitLabel }: Props) {
  const t = useTranslations('boxForm')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const [activeLang, setActiveLang] = useState<Locale>(locale)
  const [form, setForm] = useState<BoxFormData>({
    name: initialData?.name ?? {},
    price: initialData?.price ?? '',
    coverImage: initialData?.coverImage ?? '',
    startDate: initialData?.startDate ?? '',
    endDate: initialData?.endDate ?? '',
    products: initialData?.products ?? [],
    isActive: initialData?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [removedCoverImage, setRemovedCoverImage] = useState<string | null>(null)
  const { remove: removeCoverImage } = useBlobUpload('boxCoverImage')

  const { data } = useSWR('/api/admin/products', fetcher)
  const allProducts = data?.products ?? []

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return allProducts
    return allProducts.filter((p: any) =>
      [p.name?.ar, p.name?.fr, p.name?.en].some((v) => v?.toLowerCase().includes(q))
    )
  }, [allProducts, productSearch])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleLocalizedChange(value: string) {
    setForm((prev) => ({ ...prev, name: { ...prev.name, [activeLang]: value } }))
  }

  function isSelected(productId: string) {
    return form.products.some((p) => p.product === productId)
  }

  function toggleProduct(productId: string) {
    setForm((prev) => {
      if (prev.products.some((p) => p.product === productId)) {
        return { ...prev, products: prev.products.filter((p) => p.product !== productId) }
      }
      return { ...prev, products: [...prev.products, { product: productId, quantity: '1' }] }
    })
  }

  function updateQuantity(productId: string, quantity: string) {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.product === productId ? { ...p, quantity } : p)),
    }))
  }

  function removeCoverImageFile() {
    if (form.coverImage) setRemovedCoverImage(form.coverImage)
    setForm((prev) => ({ ...prev, coverImage: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.ar && !form.name.fr && !form.name.en) {
      toast.error(t('nameRequired'))
      return
    }
    if (form.products.length === 0) {
      toast.error(t('productsRequired'))
      return
    }
    setSaving(true)
    try {
      await onSubmit(form)
      // Only delete the underlying file once the box is confirmed saved without
      // it, so a discarded edit never leaves the DB pointing at a deleted blob.
      if (removedCoverImage) await removeCoverImage(removedCoverImage).catch(() => {})
      setRemovedCoverImage(null)
    } catch {
      toast.error(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } catch {
      toast.error(t('deleteError'))
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: cover image, visibility & schedule */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">{t('coverImage')}</label>
            {form.coverImage ? (
              <div className="relative w-full">
                <Image
                  src={form.coverImage}
                  alt="Box cover"
                  width={400}
                  height={400}
                  className="w-full aspect-4/5 object-cover rounded-lg border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={removeCoverImageFile}
                  className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <ImageUploadButton
                type="boxCoverImage"
                label={t('uploadCoverImage')}
                onUploaded={(urls) => {
                  if (urls[0]) setForm((prev) => ({ ...prev, coverImage: urls[0] }))
                }}
              />
            )}
            <p className="text-xs text-neutral-400 mt-2">{t('coverImageHint')}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">{t('statusVisibility')}</label>
            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-sm text-neutral-700">{t('publishedOnStore')}</span>
              <span className="relative inline-block w-11 h-6">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-neutral-200 peer-checked:bg-brand-container transition-colors" />
                <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-medium text-neutral-500 block">{t('scheduleOptional')}</label>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('startDate')}</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('endDate')}</label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>
            <p className="text-xs text-neutral-400">{t('scheduleHint')}</p>
          </div>
        </div>

        {/* Right column: box data & products */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-800">{t('generalInfo')}</h3>
              <div className="flex gap-1">
                {locales.map((l) => {
                  const filled = !!form.name[l]
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setActiveLang(l)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        activeLang === l
                          ? 'bg-brand-primary text-white'
                          : 'bg-surface-high text-neutral-600 hover:bg-brand-light'
                      }`}
                    >
                      {localeNames[l]}
                      {!filled && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeLang === l ? 'bg-white/70' : 'bg-neutral-300'
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('boxName')}</label>
              <input
                value={form.name[activeLang] ?? ''}
                onChange={(e) => handleLocalizedChange(e.target.value)}
                placeholder={t('boxNamePlaceholder')}
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('price')}</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="1200"
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-800">{t('selectProducts')}</h3>
              <span className="text-xs text-neutral-400">{t('selectedCount', { count: form.products.length })}</span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t('searchProductsPlaceholder')}
                className="w-full h-10 pl-10 pr-3 bg-surface-low rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-sm text-neutral-400 py-6">{t('noProductsFound')}</p>
              ) : (
                filteredProducts.map((p: any) => {
                  const selected = isSelected(p._id)
                  const name = resolveLocalized(p.name, locale)
                  const selection = form.products.find((sp) => sp.product === p._id)
                  return (
                    <div
                      key={p._id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
                        selected ? 'border-brand-primary bg-brand-light/30' : 'border-neutral-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleProduct(p._id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                            selected ? 'bg-brand-primary border-brand-primary text-white' : 'border-neutral-300'
                          }`}
                        >
                          {selected && <Check size={12} />}
                        </span>
                        <span className="relative w-10 h-10 rounded-lg bg-surface-high shrink-0 overflow-hidden">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
                              <Package size={14} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-neutral-800 truncate">{name}</span>
                          <span className="block text-xs text-neutral-400">{p.price.toLocaleString()} MRU</span>
                        </span>
                      </button>
                      {selected && (
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={selection?.quantity ?? '1'}
                          onChange={(e) => updateQuantity(p._id, e.target.value)}
                          className="w-16 h-9 px-2 border border-neutral-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-primary transition shrink-0"
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 sm:left-64 bg-white/90 backdrop-blur-md border-t border-neutral-200/60 px-4 py-4 shadow-[0_-4px_20px_rgba(216,150,255,0.15)] flex gap-3 sm:justify-end z-30">
        {onDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex-1 sm:flex-none px-6 h-12 border border-danger text-danger rounded-xl text-sm font-semibold hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            {t('delete')}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-2 sm:flex-none px-10 h-12 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-brand-secondary active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? t('saving') : submitLabel}
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">{t('deleteTitle')}</h2>
                <p className="text-sm text-neutral-500 mt-1">{t('deleteConfirm')}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
