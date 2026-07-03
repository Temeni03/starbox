'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading } = useSWR(`/api/products/${id}`, fetcher)
  const { addToCart } = useCart()

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24 sm:pb-6 animate-pulse max-w-lg mx-auto">
        <div className="aspect-square bg-neutral-100 rounded-xl" />
        <div className="h-6 bg-neutral-100 rounded w-2/3" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
      </div>
    )
  }

  const product = data?.product
  if (!product) {
    return (
      <div className="text-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <p>Product not found</p>
        <Link href="/" className="mt-2 text-sm text-brand-secondary hover:underline block">
          Back to shop
        </Link>
      </div>
    )
  }

  const outOfStock = product.quantity === 0
  const lowStock = !outOfStock && product.quantity <= product.lowStockThreshold
  const images: string[] = product.images ?? []

  function clampQuantity(q: number) {
    return Math.max(1, Math.min(q, product.quantity))
  }

  async function handleAddToCart() {
    if (outOfStock) return
    setAdding(true)
    try {
      await addToCart(product._id, quantity, {
        name: product.name,
        price: product.price,
        image: images[0],
      })
      toast.success('Added to cart')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add')
    } finally {
      setAdding(false)
    }
  }

  async function handleBuyNow() {
    if (outOfStock) return
    setBuying(true)
    try {
      await addToCart(product._id, quantity, {
        name: product.name,
        price: product.price,
        image: images[0],
      })
      router.push('/checkout')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to proceed')
      setBuying(false)
    }
  }

  return (
    <div className="pb-24 sm:pb-6 space-y-4 max-w-lg mx-auto">
      <Link href="/" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      {/* Images */}
      <div className="space-y-2">
        <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden">
          {images[activeImage] ? (
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <Package size={48} />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-neutral-800 text-sm font-semibold px-3 py-1.5 rounded">
                Out of stock
              </span>
            </div>
          )}
          {lowStock && (
            <span className="absolute top-3 left-3 bg-warning text-white text-xs font-medium px-2 py-0.5 rounded">
              Low stock
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  i === activeImage ? 'border-brand-primary' : 'border-transparent'
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name & price */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
        <h1 className="text-xl font-bold text-neutral-800">{product.name}</h1>
        <p className="text-2xl font-bold text-brand-primary">{product.price.toLocaleString()} MRU</p>
        <p className="text-xs text-neutral-400">
          {outOfStock ? 'Out of stock' : `${product.quantity} in stock`}
        </p>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
          <h2 className="font-semibold text-neutral-700">Description</h2>
          <p className="text-sm text-neutral-600 whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* How to use */}
      {product.usageInstructions && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
          <h2 className="font-semibold text-neutral-700">How to use</h2>
          <p className="text-sm text-neutral-600 whitespace-pre-line">{product.usageInstructions}</p>
        </div>
      )}

      {/* Quantity */}
      {!outOfStock && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-brand-secondary disabled:opacity-40 transition"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold text-neutral-800 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
              disabled={quantity >= product.quantity}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-brand-secondary disabled:opacity-40 transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || adding || buying}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-brand-primary text-brand-primary py-3 rounded-xl font-semibold hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ShoppingCart size={18} />
          {adding ? 'Adding…' : 'Add to cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock || adding || buying}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Zap size={18} />
          {buying ? 'Processing…' : 'Buy now'}
        </button>
      </div>
    </div>
  )
}
