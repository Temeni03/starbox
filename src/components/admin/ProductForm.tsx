'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
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
  submitLabel: string
}

export function ProductForm({ initialData, onSubmit, submitLabel }: Props) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Product name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. Organic Honey 500g"
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Price (MRU) *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="1"
              placeholder="1200"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Stock qty *</label>
            <input
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
              min="0"
              step="1"
              placeholder="50"
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Product description…"
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">How to use</label>
          <textarea
            name="usageInstructions"
            value={form.usageInstructions}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Apply a small amount and massage gently…"
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Low stock threshold</label>
          <input
            name="lowStockThreshold"
            type="number"
            value={form.lowStockThreshold}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="accent-brand-primary w-4 h-4"
          />
          <span className="text-sm font-medium text-neutral-700">Visible to customers</span>
        </label>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
        <h2 className="font-semibold text-neutral-700">Images</h2>
        <div className="flex flex-wrap gap-2">
          {form.images.map((url) => (
            <div key={url} className="relative group">
              <Image
                src={url}
                alt="Product"
                width={80}
                height={80}
                className="rounded-lg object-cover border border-neutral-200"
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
            onUploaded={(urls) => {
              setForm((prev) => ({
                ...prev,
                images: [...prev.images, ...urls].slice(0, MAX_PRODUCT_IMAGES),
              }))
            }}
          />
        )}
      </div>

      {/* Video */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
        <h2 className="font-semibold text-neutral-700">Video (optional)</h2>
        {form.video ? (
          <div className="relative w-full max-w-xs">
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

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
