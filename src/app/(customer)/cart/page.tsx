'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Package, ShoppingBag, AlertTriangle, ArrowRight, Lock } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export default function CartPage() {
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
      toast.error('Failed to update quantity')
    }
  }

  async function handleRemove(productId: string) {
    try {
      await removeFromCart(productId)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  async function handleClearCart() {
    setClearing(true)
    try {
      await clearCart()
      toast.success('Cart cleared')
      setConfirmClear(false)
    } catch {
      toast.error('Failed to clear cart')
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
            <ShoppingBag size={56} className="text-brand-primary" />
          </div>
        </div>
        <div className="max-w-xs space-y-2">
          <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Your cart is empty</h2>
          <p className="text-sm text-neutral-500">
            Discover our latest luxury blends and start your self-care journey.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center bg-brand-primary text-white text-sm font-semibold px-8 h-12 rounded-full shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-32 sm:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-800">Your Cart</h1>
          <span className="bg-brand-container text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full">
            {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 text-sm text-danger hover:underline"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product}
            className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-4 flex gap-4"
          >
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-high flex-shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                  <Package size={24} />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-base font-semibold text-neutral-800 truncate">{item.name}</h3>
                <button
                  onClick={() => handleRemove(item.product)}
                  className="text-neutral-400 hover:text-danger transition flex-shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex justify-between items-end mt-2">
                <span className="text-base font-semibold text-brand-primary">
                  {item.price.toLocaleString()} MRU
                </span>
                <div className="flex items-center bg-surface-high rounded-full p-1 border border-neutral-200">
                  <button
                    onClick={() =>
                      item.quantity > 1
                        ? handleQuantity(item.product, item.quantity - 1)
                        : handleRemove(item.product)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white active:scale-90 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item.product, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white active:scale-90 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white/70 backdrop-blur-md border-2 border-brand-container/20 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center text-neutral-600 text-sm">
          <span>Subtotal ({totalCount} items)</span>
          <span>{totalPrice.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
          <span className="text-lg font-semibold text-neutral-800">Total</span>
          <span className="text-2xl font-bold text-brand-primary">{totalPrice.toLocaleString()} MRU</span>
        </div>
        <Link
          href="/checkout"
          className="mt-2 w-full h-12 bg-brand-primary text-white rounded-full text-sm font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight size={16} />
        </Link>
      </div>

      <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1 mt-6">
        <Lock size={14} />
        Secure checkout
      </p>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">Clear cart</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                disabled={clearing}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {clearing ? 'Clearing…' : 'Clear cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
