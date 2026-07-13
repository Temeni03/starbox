'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { BoxForm } from '@/components/admin/BoxForm'

export default function NewBoxPage() {
  const t = useTranslations('boxForm')
  const router = useRouter()

  async function handleSubmit(data: any) {
    const res = await fetch('/api/admin/boxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        price: Number(data.price),
        coverImage: data.coverImage || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        products: data.products.map((p: any) => ({ product: p.product, quantity: Number(p.quantity) })),
        isActive: data.isActive,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? t('createError'))
    }
    toast.success(t('created'))
    router.push('/admin/boxes')
  }

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <Link href="/admin" className="hover:text-brand-primary transition">{t('breadcrumbAdmin')}</Link>
        <ChevronRight size={12} />
        <Link href="/admin/boxes" className="hover:text-brand-primary transition">{t('breadcrumbBoxes')}</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-600">{t('newBox')}</span>
      </nav>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">{t('addTitle')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('addSubtitle')}</p>
      <BoxForm onSubmit={handleSubmit} submitLabel={t('createLabel')} />
    </div>
  )
}
