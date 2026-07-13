'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'
import { useProducts } from '@/hooks/useProducts'
import { ProductMiniCard } from '@/components/ui/ProductMiniCard'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('product')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { data, isLoading } = useSWR(`/api/products/${id}`, fetcher)
  const { addToCart } = useCart()
  const { products: allProducts } = useProducts()

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24 sm:pb-6 animate-pulse max-w-lg mx-auto">
        <div className="aspect-[4/5] bg-neutral-100 rounded-2xl" />
        <div className="h-6 bg-neutral-100 rounded w-2/3" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
      </div>
    )
  }

  const product = data?.product
  if (!product) {
    return (
      <div className="text-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <p>{t('notFound')}</p>
        <Link href="/" className="mt-2 text-sm text-brand-secondary hover:underline block">
          {t('backToShop')}
        </Link>
      </div>
    )
  }

  const outOfStock = product.quantity === 0
  const lowStock = !outOfStock && product.quantity <= product.lowStockThreshold
  const images: string[] = product.images ?? []
  const recommended = allProducts.filter((p) => p._id !== product._id).slice(0, 6)

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
      toast.success(tCommon('addedToCart'))
    } catch (err: any) {
      toast.error(err.message ?? tCommon('addToCartError'))
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
      toast.error(err.message ?? t('buyNowError'))
      setBuying(false)
    }
  }

  return (
    <div className="pb-28 sm:pb-6 max-w-lg mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition mb-3">
        <ArrowLeft size={16} /> {t('backToShop')}
      </Link>

      {/* Hero image */}
      <div className="relative aspect-[4/5] bg-surface-high rounded-2xl overflow-hidden">
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
              {tCommon('outOfStock')}
            </span>
          </div>
        )}
        {lowStock && (
          <span className="absolute top-3 left-3 bg-warning text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {tCommon('lowStock')}
          </span>
        )}
      </div>

      {/* Overlapping info panel */}
      <div className="bg-white -mt-6 relative z-10 rounded-t-3xl shadow-xl shadow-brand-primary/5 p-5">
        {images.length > 1 && (
          <div className="flex gap-2 mb-4">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setActiveImage(i)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                  i === activeImage ? 'border-brand-primary' : 'border-transparent'
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-start gap-3 mb-4">
          <h1 className="text-2xl font-bold text-neutral-800">{product.name}</h1>
          <span className="text-2xl font-bold text-brand-primary whitespace-nowrap">
            {product.price.toLocaleString()} MRU
          </span>
        </div>

        <div className="flex items-center gap-2 py-3 border-y border-neutral-100 mb-5">
          <span className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-neutral-300' : 'bg-success animate-pulse'}`} />
          <span className="text-sm font-medium text-neutral-600">
            {outOfStock ? tCommon('outOfStock') : t('inStock', { count: product.quantity })}
          </span>
        </div>

        {/* Quantity */}
        {!outOfStock && (
          <div className="mb-6">
            <label className="text-xs font-medium text-neutral-500 block mb-2">{t('quantity')}</label>
            <div className="inline-flex items-center bg-surface-high rounded-full p-1">
              <button
                onClick={() => setQuantity((q) => clampQuantity(q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-full text-brand-primary hover:bg-white disabled:opacity-40 active:scale-90 transition"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-lg font-bold text-neutral-800">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => clampQuantity(q + 1))}
                disabled={quantity >= product.quantity}
                className="w-9 h-9 flex items-center justify-center rounded-full text-brand-primary hover:bg-white disabled:opacity-40 active:scale-90 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1.5">{t('description')}</h2>
            <p className="text-sm text-neutral-600 whitespace-pre-line leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* How to use */}
        {product.usageInstructions && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1.5">{t('howToUse')}</h2>
            <p className="text-sm text-neutral-600 whitespace-pre-line leading-relaxed">{product.usageInstructions}</p>
          </div>
        )}

        {/* Video */}
        {product.video && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-1.5">{t('productVideo')}</h2>
            <video src={product.video} controls className="w-full rounded-xl" />
          </div>
        )}

        {/* Recommendations */}
        {recommended.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-neutral-800 mb-3">{t('recommended')}</h2>
            <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] -mx-5 px-5">
              {recommended.map((p) => (
                <ProductMiniCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-16 sm:bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-neutral-200/60 px-4 py-3">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || adding || buying}
            className="flex-1 flex items-center justify-center gap-2 border border-brand-primary text-brand-primary py-3 rounded-xl font-semibold hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ShoppingCart size={18} />
            {adding ? t('adding') : t('addToCart')}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock || adding || buying}
            className="flex-[1.5] flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Zap size={18} />
            {buying ? t('processing') : t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  )
}
