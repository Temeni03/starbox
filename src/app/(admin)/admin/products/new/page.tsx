'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const t = useTranslations('productForm')
  const router = useRouter()

  async function handleSubmit(data: any) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        price: Number(data.price),
        description: data.description,
        usageInstructions: data.usageInstructions,
        quantity: Number(data.quantity),
        lowStockThreshold: Number(data.lowStockThreshold),
        images: data.images,
        video: data.video || undefined,
        isActive: data.isActive,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? t('createError'))
    }
    toast.success(t('created'))
    router.push('/admin/products')
  }

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <Link href="/admin" className="hover:text-brand-primary transition">{t('breadcrumbAdmin')}</Link>
        <ChevronRight size={14} />
        <Link href="/admin/products" className="hover:text-brand-primary transition">{t('breadcrumbProducts')}</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-600">{t('newProduct')}</span>
      </nav>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">{t('addTitle')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('addSubtitle')}</p>
      <ProductForm onSubmit={handleSubmit} submitLabel={t('createLabel')} />
    </div>
  )
}
