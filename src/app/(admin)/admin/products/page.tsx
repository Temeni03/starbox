'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, EyeOff, Package, AlertTriangle } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminProductsPage() {
  const { data, isLoading, mutate } = useSWR('/api/admin/products', fetcher)
  const products = data?.products ?? []

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      mutate()
      toast.success(current ? 'Product hidden' : 'Product activated')
    } catch {
      toast.error('Failed to update product')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No products yet</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {products.map((p: any) => {
              const lowStock = p.isActive && p.quantity <= p.lowStockThreshold
              return (
                <div key={p._id} className={`flex items-center gap-4 px-5 py-3 ${!p.isActive ? 'opacity-50' : ''}`}>
                  <div className="relative w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                        <Package size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-800 truncate">{p.name}</p>
                      {lowStock && (
                        <span className="flex items-center gap-0.5 text-warning text-xs">
                          <AlertTriangle size={12} />
                          Low
                        </span>
                      )}
                      {!p.isActive && (
                        <span className="text-xs text-neutral-400">Hidden</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {p.price.toLocaleString()} DA · Qty: {p.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/products/${p._id}/edit`}
                      className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => toggleActive(p._id, p.isActive)}
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-neutral-50 rounded-lg transition"
                      title={p.isActive ? 'Hide' : 'Show'}
                    >
                      <EyeOff size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
