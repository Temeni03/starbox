'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, AlertTriangle, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'

const MAX_PRODUCT_IMAGES = 5

interface ProductFormData {
  name: string
  price: string
  description: string
  usageInstructions: string
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
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    price: initialData?.price ?? '',
    description: initialData?.description ?? '',
    usageInstructions: initialData?.usageInstructions ?? '',
    quantity: initialData?.quantity ?? '',
    lowStockThreshold: initialData?.lowStockThreshold ?? '10',
    images: initialData?.images ?? [],
    video: initialData?.video ?? '',
    isActive: initialData?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
    } catch {
      toast.error('Failed to save product')
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
      toast.error('Failed to delete product')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: media & visibility */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">Product Imagery</label>
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
                label="Upload images"
                onUploaded={(urls) => {
                  setForm((prev) => ({
                    ...prev,
                    images: [...prev.images, ...urls].slice(0, MAX_PRODUCT_IMAGES),
                  }))
                }}
              />
            )}
            <p className="text-xs text-neutral-400 mt-2">Up to {MAX_PRODUCT_IMAGES} images. JPG or PNG.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-neutral-500 mb-3 block">Status &amp; Visibility</label>
            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-sm text-neutral-700">Published on Store</span>
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
            <label className="text-xs font-medium text-neutral-500 mb-3 block">Video (optional)</label>
            {form.video ? (
              <div className="relative w-full">
                <video src={form.video} controls className="w-full rounded-lg border border-neutral-200" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, video: '' }))}
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
            <h3 className="text-base font-semibold text-neutral-800">General Information</h3>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Product name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Organic Honey 500g"
                className="w-full h-11 px-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Price (MRU) *</label>
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
                <label className="block text-xs font-medium text-neutral-500 mb-1">Available Quantity *</label>
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
              <label className="block text-xs font-medium text-neutral-500 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description…"
                className="w-full p-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Usage Instructions</label>
              <textarea
                name="usageInstructions"
                value={form.usageInstructions}
                onChange={handleChange}
                rows={3}
                placeholder="How should customers use this product?"
                className="w-full p-4 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Low stock threshold</label>
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
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-2 sm:flex-none px-10 h-12 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-brand-secondary active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving…' : submitLabel}
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
                <h2 className="font-semibold text-neutral-800">Delete product</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  This action cannot be undone. The product will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
