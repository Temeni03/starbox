'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Package, ShoppingBag, AlertTriangle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { isLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())

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
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-3 animate-pulse">
            <div className="w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-3/4" />
              <div className="h-4 bg-neutral-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <ShoppingBag size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/" className="mt-4 text-sm text-brand-secondary hover:underline">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-32 sm:pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-neutral-800">My Cart</h1>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 text-sm text-danger hover:underline"
        >
          <Trash2 size={14} />
          Clear cart
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.product}
            className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-3"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                  <Package size={24} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 line-clamp-2">{item.name}</p>
              <p className="text-sm text-brand-primary font-semibold mt-0.5">
                {item.price.toLocaleString()} MRU
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity > 1
                        ? handleQuantity(item.product, item.quantity - 1)
                        : handleRemove(item.product)
                    }
                    className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item.product, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-700">
                    {(item.price * item.quantity).toLocaleString()} MRU
                  </span>
                  <button
                    onClick={() => handleRemove(item.product)}
                    className="text-neutral-400 hover:text-danger transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>{totalPrice.toLocaleString()} MRU</span>
        </div>
        <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-800">
          <span>Total</span>
          <span>{totalPrice.toLocaleString()} MRU</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-brand-primary text-white text-center py-3 rounded-xl font-medium hover:bg-brand-secondary transition"
        >
          Proceed to Checkout
        </Link>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5 space-y-4">
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
