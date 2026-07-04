'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { ProductForm } from '@/components/admin/ProductForm'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
      throw new Error(d.error ?? 'Failed to update product')
    }
    toast.success('Product updated')
    router.push('/admin/products')
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-6 bg-neutral-200 rounded w-1/3" />
      <div className="h-64 bg-white rounded-xl border border-neutral-200" />
    </div>
  }

  const p = data?.product
  if (!p) return <div className="text-neutral-400">Product not found</div>

  return (
    <div className="max-w-lg space-y-4">
      <Link href="/admin/products" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-neutral-800">Edit Product</h1>
      <ProductForm
        initialData={{
          name: p.name,
          price: String(p.price),
          description: p.description ?? '',
          usageInstructions: p.usageInstructions ?? '',
          quantity: String(p.quantity),
          lowStockThreshold: String(p.lowStockThreshold),
          images: p.images ?? [],
          video: p.video ?? '',
          isActive: p.isActive,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  )
}
