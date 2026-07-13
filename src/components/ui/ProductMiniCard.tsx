'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'

interface MiniProduct {
  _id: string
  name: string
  price: number
  images?: string[]
}

export function ProductMiniCard({ product }: { product: MiniProduct }) {
  return (
    <Link
      href={`/products/${product._id}`}
      className="min-w-[130px] w-[130px] bg-surface-low p-2 rounded-xl border border-neutral-100 shrink-0"
    >
      <div className="relative aspect-square rounded-lg mb-2 overflow-hidden bg-surface-high">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="130px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <Package size={20} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
      <p className="text-sm text-brand-primary font-semibold">{product.price.toLocaleString()} MRU</p>
    </Link>
  )
}
