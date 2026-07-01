'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/hooks/useProducts'

interface Props {
  product: Product
  onAddToCart: (productId: string) => Promise<void>
}

export function ProductCard({ product, onAddToCart }: Props) {
  const [loading, setLoading] = useState(false)
  const outOfStock = product.quantity === 0
  const lowStock = !outOfStock && product.quantity <= product.lowStockThreshold

  async function handleAdd() {
    if (outOfStock) return
    setLoading(true)
    try {
      await onAddToCart(product._id)
      toast.success('Added to cart')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-neutral-100">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <Package size={40} />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-neutral-800 text-xs font-semibold px-2 py-1 rounded">
              Out of stock
            </span>
          </div>
        )}
        {lowStock && (
          <span className="absolute top-2 left-2 bg-warning text-white text-xs font-medium px-2 py-0.5 rounded">
            Low stock
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-brand-primary">
            {product.price.toLocaleString()} DA
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock || loading}
            className="flex items-center gap-1 bg-brand-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ShoppingCart size={14} />
            {loading ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
