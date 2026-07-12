'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { X, AlertTriangle, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { useBlobUpload } from '@/hooks/useBlobUpload'
import { locales, localeNames, type Locale } from '@/i18n/config'
import type { LocalizedText } from '@/types/localized'

const MAX_PRODUCT_IMAGES = 5

interface ProductFormData {
  name: LocalizedText
  price: string
  description: LocalizedText
  usageInstructions: LocalizedText
  quantity: string
  lowStockThreshold: string
  images: string[]
  video?: string
  isActive: boolean
}

interface Props {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onDelete?: () => Promise<void>
  submitLabel: string
}

export function ProductForm({ initialData, onSubmit, onDelete, submitLabel }: Props) {
  const t = useTranslations('productForm')
  const tCommon = useTranslations('common')
  const [activeLang, setActiveLang] = useState<Locale>(useLocale() as Locale)
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? {},
    price: initialData?.price ?? '',
    description: initialData?.description ?? {},
    usageInstructions: initialData?.usageInstructions ?? {},
    quantity: initialData?.quantity ?? '',
    lowStockThreshold: initialData?.lowStockThreshold ?? '10',
    images: initialData?.images ?? [],
    video: initialData?.video ?? '',
    isActive: initialData?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [removedVideo, setRemovedVideo] = useState<string | null>(null)
  const { remove: removeProductImage } = useBlobUpload('productImage')
  const { remove: removeProductVideo } = useBlobUpload('productVideo')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleLocalizedChange(field: 'name' | 'description' | 'usageInstructions', value: string) {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [activeLang]: value } }))
  }

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }))
    setRemovedImages((prev) => [...prev, url])
  }

  function removeVideo(url: string) {
    setForm((prev) => ({ ...prev, video: '' }))
    setRemovedVideo(url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.ar && !form.name.fr && !form.name.en) {
      toast.error(t('nameRequired'))
      return
    }
    setSaving(true)
    try {
      await onSubmit(form)
      // Only delete the underlying files once the product is confirmed saved
      // without them, so a discarded edit never leaves the DB pointing at a
      // deleted blob.
      await Promise.all(removedImages.map((url) => removeProductImage(url).catch(() => {})))
      if (removedVideo) await removeProductVideo(removedVideo).catch(() => {})
      setRemovedImages([])
      setRemovedVideo(null)
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
        {/* Left column: media & visibility */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">{t('productImagery')}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.images.map((url) => (
                <div key={url} className="relative group">
                  <Image
                    src={url}
                    alt="Product"
                    width={80}
                    height={80}
                    className="rounded-lg object-cover border border-neutral-200 w-20 h-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            {form.images.length < MAX_PRODUCT_IMAGES && (
              <ImageUploadButton
                type="productImage"
                multiple
                label={t('uploadImages')}
                onUploaded={(urls) => {
                  setForm((prev) => ({
                    ...prev,
                    images: [...prev.images, ...urls].slice(0, MAX_PRODUCT_IMAGES),
                  }))
                }}
              />
            )}
            <p className="text-xs text-neutral-400 mt-2">{t('imagesHint', { max: MAX_PRODUCT_IMAGES })}</p>
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

          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">{t('videoOptional')}</label>
            {form.video ? (
              <div className="relative w-full">
                <video src={form.video} controls className="w-full rounded-lg border border-neutral-200" />
                <button
                  type="button"
                  onClick={() => removeVideo(form.video!)}
                  className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <ImageUploadButton
                type="productVideo"
                onUploaded={(urls) => {
                  if (urls[0]) setForm((prev) => ({ ...prev, video: urls[0] }))
                }}
              />
            )}
          </div>
        </div>

        {/* Right column: product data */}
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
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('productName')}</label>
              <input
                value={form.name[activeLang] ?? ''}
                onChange={(e) => handleLocalizedChange('name', e.target.value)}
                placeholder={t('productNamePlaceholder')}
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">{t('quantity')}</label>
                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="50"
                  className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('description')}</label>
              <textarea
                value={form.description[activeLang] ?? ''}
                onChange={(e) => handleLocalizedChange('description', e.target.value)}
                rows={3}
                placeholder={t('descriptionPlaceholder')}
                className="w-full p-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('usageInstructions')}</label>
              <textarea
                value={form.usageInstructions[activeLang] ?? ''}
                onChange={(e) => handleLocalizedChange('usageInstructions', e.target.value)}
                rows={3}
                placeholder={t('usageInstructionsPlaceholder')}
                className="w-full p-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{t('lowStockThreshold')}</label>
              <input
                name="lowStockThreshold"
                type="number"
                value={form.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
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
                <p className="text-sm text-neutral-500 mt-1">
                  {t('deleteConfirm')}
                </p>
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
