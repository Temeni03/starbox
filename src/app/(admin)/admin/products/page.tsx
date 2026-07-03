'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, EyeOff, Eye, Trash2, Search, Package, AlertTriangle } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminProductsPage() {
  const { data, isLoading, mutate } = useSWR('/api/admin/products', fetcher)
  const products = data?.products ?? []

  const [search, setSearch] = useState('')
  const [productToDelete, setProductToDelete] = useState<{ _id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p: any) => p.name?.toLowerCase().includes(q))
  }, [products, search])

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

  async function deleteProduct() {
    if (!productToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productToDelete._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      mutate()
      toast.success('Product deleted')
      setProductToDelete(null)
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
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

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a product by name…"
          className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        />
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
        ) : filteredProducts.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No product matches &quot;{search}&quot;</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredProducts.map((p: any) => {
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
                      {p.price.toLocaleString()} MRU · Qty: {p.quantity}
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
                      className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-50 rounded-lg transition"
                      title={p.isActive ? 'Hide' : 'Show'}
                    >
                      {p.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => setProductToDelete({ _id: p._id, name: p.name })}
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-neutral-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">Delete product</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Are you sure you want to delete <span className="font-medium text-neutral-700">{productToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteProduct}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
