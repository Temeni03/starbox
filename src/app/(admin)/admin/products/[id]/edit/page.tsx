'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { ProductForm } from '@/components/admin/ProductForm'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('productForm')
  const tAdminProducts = useTranslations('adminProducts')
  const router = useRouter()
  const { data, isLoading } = useSWR(`/api/admin/products/${id}`, fetcher)

  async function handleSubmit(formData: any) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        usageInstructions: formData.usageInstructions,
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: formData.images,
        video: formData.video ?? '',
        isActive: formData.isActive,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? t('updateError2'))
    }
    toast.success(t('updated'))
    router.push('/admin/products')
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(tAdminProducts('deleteError'))
    toast.success(tAdminProducts('productDeleted'))
    router.push('/admin/products')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
        <div className="h-64 bg-white rounded-xl border border-neutral-200" />
      </div>
    )
  }

  const p = data?.product
  if (!p) return <div className="text-neutral-400">{t('notFound')}</div>

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <Link href="/admin" className="hover:text-brand-primary transition">{t('breadcrumbAdmin')}</Link>
        <ChevronRight size={12} />
        <Link href="/admin/products" className="hover:text-brand-primary transition">{t('breadcrumbProducts')}</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-600">{t('editProduct')}</span>
      </nav>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">{t('editTitle')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('editSubtitle')}</p>
      <ProductForm
        initialData={{
          name: p.name ?? {},
          price: String(p.price),
          description: p.description ?? {},
          usageInstructions: p.usageInstructions ?? {},
          quantity: String(p.quantity),
          lowStockThreshold: String(p.lowStockThreshold),
          images: p.images ?? [],
          video: p.video ?? '',
          isActive: p.isActive,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel={t('saveLabel')}
      />
    </div>
  )
}
