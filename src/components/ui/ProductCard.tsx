'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/hooks/useProducts'

interface Props {
  product: Product
  onAddToCart: (productId: string) => Promise<void>
}

export function ProductCard({ product, onAddToCart }: Props) {
  const t = useTranslations('common')
  const tProduct = useTranslations('product')
  const [loading, setLoading] = useState(false)
  const outOfStock = product.quantity === 0
  const lowStock = !outOfStock && product.quantity <= product.lowStockThreshold

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    setLoading(true)
    try {
      await onAddToCart(product._id)
      toast.success(t('addedToCart'))
    } catch (err: any) {
      toast.error(err.message ?? t('addToCartError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/products/${product._id}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-surface-high shadow-[0_10px_25px_-5px_rgba(216,150,255,0.25),0_8px_10px_-6px_rgba(216,150,255,0.15)]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
              {t('outOfStock')}
            </span>
          </div>
        )}
        {lowStock && (
          <span className="absolute top-3 left-3 bg-warning text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {t('lowStock')}
          </span>
        )}
        <button
          onClick={handleAdd}
          disabled={outOfStock || loading}
          aria-label={tProduct('addToCartAria')}
          className="absolute bottom-3 right-3 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      <h3 className="text-base font-semibold text-neutral-800 truncate mb-1">
        {product.name}
      </h3>
      {product.description && (
        <p className="text-xs text-neutral-500 mb-2 truncate">{product.description}</p>
      )}
      <div className="mt-auto">
        <span className="text-base font-semibold text-brand-primary">
          {product.price.toLocaleString()} MRU
        </span>
      </div>
    </Link>
  )
}
