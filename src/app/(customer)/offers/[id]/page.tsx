'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Gift, ShoppingCart, Zap } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from '@/components/ui/CartItemRow'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BoxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('offers')
  const tCommon = useTranslations('common')
  const tProduct = useTranslations('product')
  const router = useRouter()
  const { data, isLoading } = useSWR(`/api/boxes/${id}`, fetcher)
  const { addToCart } = useCart()

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

  const box = data?.box
  if (!box) {
    return (
      <div className="text-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <p>{t('notFound')}</p>
        <Link href="/" replace className="mt-2 text-sm text-brand-secondary hover:underline block">
          {t('backToShop')}
        </Link>
      </div>
    )
  }

  async function handleAddToCart() {
    setAdding(true)
    try {
      await addToCart(box._id, 1, {
        itemType: 'box',
        name: box.name,
        price: box.price,
        image: box.coverImage,
      })
      toast.success(tCommon('addedToCart'))
    } catch (err: any) {
      toast.error(err.message ?? tCommon('addToCartError'))
    } finally {
      setAdding(false)
    }
  }

  async function handleBuyNow() {
    setBuying(true)
    try {
      await addToCart(box._id, 1, {
        itemType: 'box',
        name: box.name,
        price: box.price,
        image: box.coverImage,
      })
      router.push('/checkout')
    } catch (err: any) {
      toast.error(err.message ?? tProduct('buyNowError'))
      setBuying(false)
    }
  }

  return (
    <div className="pb-28 sm:pb-6 max-w-lg mx-auto">
      <Link href="/" replace className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition mb-3">
        <ArrowLeft size={16} /> {t('backToShop')}
      </Link>

      {/* Hero */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container flex items-center justify-center">
        {box.coverImage ? (
          <Image src={box.coverImage} alt={box.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 512px" priority />
        ) : (
          <Gift size={64} className="text-white/90" />
        )}
      </div>

      {/* Overlapping info panel */}
      <div className="bg-white -mt-6 relative z-10 rounded-t-3xl shadow-xl shadow-brand-primary/5 p-5">
        <div className="flex justify-between items-start gap-3 mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">{box.name}</h1>
          <span className="text-2xl font-bold text-brand-primary whitespace-nowrap">
            {box.price.toLocaleString()} MRU
          </span>
        </div>

        {box.products?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-neutral-800 mb-3">{t('includedProducts')}</h2>
            <div className="flex flex-col gap-3">
              {box.products.map((p: any) => (
                <CartItemRow
                  key={p._id}
                  href={`/products/${p._id}`}
                  image={p.images?.[0]}
                  name={p.name}
                  price={p.price}
                  quantity={p.quantity}
                />
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
            disabled={adding || buying}
            className="flex-1 flex items-center justify-center gap-2 border border-brand-primary text-brand-primary py-3 rounded-xl font-semibold hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ShoppingCart size={18} />
            {adding ? tProduct('adding') : tProduct('addToCart')}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={adding || buying}
            className="flex-[1.5] flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Zap size={18} />
            {buying ? tProduct('processing') : tProduct('buyNow')}
          </button>
        </div>
      </div>
    </div>
  )
}
