'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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
      throw new Error(d.error ?? 'Failed to create product')
    }
    toast.success('Product created')
    router.push('/admin/products')
  }

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <Link href="/admin" className="hover:text-brand-primary transition">Admin</Link>
        <ChevronRight size={12} />
        <Link href="/admin/products" className="hover:text-brand-primary transition">Products</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-600">New Product</span>
      </nav>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">Add Product</h1>
      <p className="text-sm text-neutral-500 mb-6">Create a new luxury item for your catalog.</p>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  )
}
