'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Package, Copy, Check, ArrowLeft, ChevronRight, Store, Truck, Landmark, Banknote } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { ImageUploadButton } from '@/components/ui/ImageUploadButton'
import { LocationSelect } from '@/components/ui/LocationSelect'
import type { DeliveryLocation } from '@/hooks/useDeliveryLocations'

const BANK_PAYMENT_CODE = 'STORE-001'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clear)

  const [deliveryOption, setDeliveryOption] = useState<'home' | 'pickup'>('home')
  const [location, setLocation] = useState<DeliveryLocation | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(BANK_PAYMENT_CODE)
      setCodeCopied(true)
      toast.success(t('codeCopied'))
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      toast.error(t('copyCodeError'))
    }
  }

  const deliveryFee = deliveryOption === 'home' ? (location?.price ?? 0) : 0
  const grandTotal = totalPrice + deliveryFee

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) router.replace('/cart')
  }, [items.length, orderPlaced, router])

  if (items.length === 0 && !orderPlaced) {
    return null
  }

  async function handleConfirm() {
    if (deliveryOption === 'home' && !location) {
      toast.error(t('selectLocationError'))
      return
    }
    if (paymentMethod === 'bank_transfer' && !screenshot) {
      toast.error(t('uploadScreenshotError'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryOption,
          deliveryLocationId: deliveryOption === 'home' ? location?._id : undefined,
          paymentMethod,
          paymentScreenshot: paymentMethod === 'bank_transfer' ? screenshot : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t('placeOrderError'))
        return
      }

      setOrderPlaced(true)
      clearCart()
      toast.success(t('orderSuccess'))
      router.push(`/orders/${data.orderId}`)
    } catch {
      toast.error(tCommon('somethingWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-44 sm:pb-28 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/cart"
          aria-label={t('backToCartAria')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-light/50 transition -ml-1.5"
        >
          <ArrowLeft size={20} className="text-brand-primary" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
      </div>

      {/* Delivery Method */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-3">{t('deliveryMethod')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: 'pickup', label: t('storePickup'), sub: tCommon('free'), icon: Store },
              {
                value: 'home',
                label: t('homeDelivery'),
                sub: location ? `${location.price.toLocaleString()} MRU` : t('selectZone'),
                icon: Truck,
              },
            ] as const
          ).map(({ value, label, sub, icon: Icon }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name="delivery"
                value={value}
                checked={deliveryOption === value}
                onChange={() => setDeliveryOption(value)}
                className="peer sr-only"
              />
              <div className="p-4 rounded-xl border-2 border-neutral-200 bg-white peer-checked:border-brand-primary peer-checked:bg-brand-light/50 transition-all flex flex-col items-center text-center gap-1.5">
                <Icon size={22} className="text-brand-primary" />
                <span className="text-sm font-semibold text-neutral-800">{label}</span>
                <span className="text-xs text-neutral-500">{sub}</span>
              </div>
            </label>
          ))}
        </div>

        {deliveryOption === 'home' && (
          <div className="mt-3">
            <LocationSelect value={location} onChange={setLocation} />
          </div>
        )}
      </section>

      {/* Order items summary */}
      <section className="mb-6 bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-4">
        <h2 className="text-base font-semibold text-neutral-800 mb-3">{t('orderSummary')}</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.product} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-high shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                    <Package size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 truncate">{item.name}</p>
                <p className="text-xs text-neutral-500">× {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-neutral-700">
                {(item.price * item.quantity).toLocaleString()} MRU
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment method */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-3">{t('paymentMethod')}</h2>
        <div className="space-y-3">
          {(
            [
              { value: 'bank_transfer', label: t('bankTransfer'), sub: t('bankTransferSub'), icon: Landmark },
              { value: 'cash', label: t('cashOnDelivery'), sub: t('cashSub'), icon: Banknote },
            ] as const
          ).map(({ value, label, sub, icon: Icon }) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === value ? 'border-brand-primary bg-brand-light/50' : 'border-neutral-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={value}
                checked={paymentMethod === value}
                onChange={() => setPaymentMethod(value)}
                className="accent-brand-primary w-5 h-5"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-800">{label}</div>
                <div className="text-xs text-neutral-500">{sub}</div>
              </div>
              <Icon size={20} className="text-brand-primary" />
            </label>
          ))}
        </div>

        {paymentMethod === 'bank_transfer' && (
          <div className="mt-3 p-4 rounded-xl border border-neutral-200 bg-surface-low space-y-3">
            <p className="text-xs text-neutral-600">
              {t.rich('transferInstructions', {
                amount: `${grandTotal.toLocaleString()} MRU`,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center justify-between gap-2 w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 hover:border-brand-primary transition"
            >
              <span className="text-sm font-mono font-semibold text-brand-primary tracking-wide">
                {BANK_PAYMENT_CODE}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                {codeCopied ? (
                  <>
                    <Check size={14} className="text-success" /> {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy size={14} /> {tCommon('copy')}
                  </>
                )}
              </span>
            </button>
            {screenshot ? (
              <div className="flex items-center gap-2">
                <Image src={screenshot} alt="Receipt" width={60} height={60} className="rounded-lg object-cover" />
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-xs text-danger hover:underline"
                >
                  {tCommon('remove')}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-brand-primary/30 bg-brand-container/5">
                <ImageUploadButton
                  type="paymentScreenshot"
                  onUploaded={(urls) => {
                    if (urls[0]) setScreenshot(urls[0])
                  }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Totals */}
      <section className="bg-white/70 backdrop-blur-md border-2 border-brand-container/20 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center text-sm text-neutral-600">
          <span>{tCommon('subtotal')}</span>
          <span className="font-medium text-neutral-700">{totalPrice.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between items-center text-sm text-neutral-600">
          <span>{t('deliveryFee')}</span>
          <span className="font-medium text-neutral-700">
            {deliveryFee === 0 ? tCommon('free') : `${deliveryFee.toLocaleString()} MRU`}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-3">
          <span className="text-lg font-semibold text-neutral-800">{tCommon('total')}</span>
          <span className="text-2xl font-bold text-brand-primary">{grandTotal.toLocaleString()} MRU</span>
        </div>
      </section>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-16 sm:bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-t border-neutral-200/60 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-14 bg-brand-primary text-white rounded-full font-semibold text-base flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? t('placingOrder') : t('completeOrder')}
            {!loading && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
