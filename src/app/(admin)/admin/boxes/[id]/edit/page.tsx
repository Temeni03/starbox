'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { BoxForm } from '@/components/admin/BoxForm'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function toDateInputValue(value?: string) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function EditBoxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('boxForm')
  const tAdminBoxes = useTranslations('adminBoxes')
  const router = useRouter()
  const { data, isLoading } = useSWR(`/api/admin/boxes/${id}`, fetcher)

  async function handleSubmit(formData: any) {
    const res = await fetch(`/api/admin/boxes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        price: Number(formData.price),
        coverImage: formData.coverImage || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        products: formData.products.map((p: any) => ({ product: p.product, quantity: Number(p.quantity) })),
        isActive: formData.isActive,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? t('updateError2'))
    }
    toast.success(t('updated'))
    router.push('/admin/boxes')
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/boxes/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(tAdminBoxes('deleteError'))
    toast.success(tAdminBoxes('boxDeleted'))
    router.push('/admin/boxes')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
        <div className="h-64 bg-white rounded-xl border border-neutral-200" />
      </div>
    )
  }

  const b = data?.box
  if (!b) return <div className="text-neutral-400">{t('notFound')}</div>

  return (
    <div className="max-w-4xl mt-12">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <Link href="/admin" className="hover:text-brand-primary transition">
          {t('breadcrumbAdmin')}
        </Link>
        <ChevronRight size={12} />
        <Link href="/admin/boxes" className="hover:text-brand-primary transition">
          {t('breadcrumbBoxes')}
        </Link>
        <ChevronRight size={12} />
        <span className="text-neutral-600">{t('editBox')}</span>
      </nav>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">{t('editTitle')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('editSubtitle')}</p>
      <BoxForm
        initialData={{
          name: b.name ?? {},
          price: String(b.price),
          coverImage: b.coverImage ?? '',
          startDate: toDateInputValue(b.startDate),
          endDate: toDateInputValue(b.endDate),
          products: (b.products ?? [])
            .filter((bp: any) => bp.product)
            .map((bp: any) => ({ product: bp.product._id, quantity: String(bp.quantity) })),
          isActive: b.isActive,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel={t('saveLabel')}
      />
    </div>
  )
}
