'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const router = useRouter()

  async function handleSubmit(data: any) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        price: Number(data.price),
        description: data.description,
        quantity: Number(data.quantity),
        lowStockThreshold: Number(data.lowStockThreshold),
        images: data.images,
        isActive: data.isActive,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? 'Failed to create product')
    }
    toast.success('Product created')
    router.push('/admin/products')
  }

  return (
    <div className="max-w-lg space-y-4">
      <Link href="/admin/products" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-neutral-800">Add Product</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  )
}
