'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import { CartItemRow } from '@/components/ui/CartItemRow'
import toast from 'react-hot-toast'

export default function CartPage() {
  const t = useTranslations('cart')
  const tCommon = useTranslations('common')
  const { isLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const totalCount = items.reduce((s, i) => s + i.quantity, 0)

  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  async function handleQuantity(productId: string, quantity: number) {
    try {
      await updateQuantity(productId, quantity)
    } catch {
      toast.error(t('updateQuantityError'))
    }
  }

  async function handleRemove(productId: string) {
    try {
      await removeFromCart(productId)
      toast.success(t('itemRemoved'))
    } catch {
      toast.error(t('removeItemError'))
    }
  }

  async function handleClearCart() {
    setClearing(true)
    try {
      await clearCart()
      toast.success(t('cartCleared'))
      setConfirmClear(false)
    } catch {
      toast.error(t('clearCartError'))
    } finally {
      setClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 pb-20 sm:pb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/70 rounded-xl border border-brand-light/60 p-4 flex gap-3 animate-pulse">
            <div className="w-24 h-24 bg-surface-high rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-high rounded w-3/4" />
              <div className="h-4 bg-surface-high rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 pb-24 sm:pb-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-container/30 blur-3xl rounded-full" />
          <div className="relative z-10 bg-white/70 backdrop-blur-md p-8 rounded-full border-2 border-brand-container/50">
            <Icon name="shopping_bag" size={40} className="text-brand-primary" />
          </div>
        </div>
        <div className="max-w-xs space-y-2">
          <h2 className="text-headline-md text-neutral-800">{t('emptyTitle')}</h2>
          <p className="text-body-md text-neutral-500">
            {t('emptyDesc')}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center bg-brand-primary text-white text-label-lg px-8 h-12 rounded-full shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {t('exploreProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-32 sm:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-neutral-800">{t('title')}</h1>
          <span className="bg-brand-container text-brand-secondary text-label-sm px-3 py-1 rounded-full">
            {t('itemCount', { count: totalCount })}
          </span>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 text-label-lg text-danger hover:underline"
        >
          <Icon name="delete" size={14} />
          {t('clear')}
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <CartItemRow
            key={item.product}
            image={item.image}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            onIncrement={() => handleQuantity(item.product, item.quantity + 1)}
            onDecrement={() =>
              item.quantity > 1
                ? handleQuantity(item.product, item.quantity - 1)
                : handleRemove(item.product)
            }
            onRemove={() => handleRemove(item.product)}
            removeAriaLabel={t('removeItemAria')}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white/70 backdrop-blur-md border-2 border-brand-container/20 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center text-neutral-600 text-body-md">
          <span>{t('subtotalItems', { count: totalCount })}</span>
          <span>{totalPrice.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
          <span className="text-headline-md text-neutral-800">{tCommon('total')}</span>
          <span className="text-headline-xl text-brand-primary">{totalPrice.toLocaleString()} MRU</span>
        </div>
        <Link
          href="/checkout"
          className="mt-2 w-full h-12 bg-brand-primary text-white rounded-full text-label-lg shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {t('proceedToCheckout')}
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>

      <p className="text-center text-label-sm text-neutral-400 flex items-center justify-center gap-1 mt-6">
        <Icon name="lock" size={14} />
        {t('secureCheckout')}
      </p>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <Icon name="warning" size={20} />
              </div>
              <div>
                <h2 className="text-headline-md text-neutral-800">{t('clearCartTitle')}</h2>
                <p className="text-body-md text-neutral-500 mt-1">
                  {t('clearCartConfirm')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                disabled={clearing}
                className="px-4 py-2 text-label-lg text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="px-4 py-2 text-label-lg text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {clearing ? t('clearing') : t('clearCartButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
