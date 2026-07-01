'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { UploadButton } from '@/lib/uploadthing-components'

const DELIVERY_FEE = 500

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clear)

  const [deliveryOption, setDeliveryOption] = useState<'home' | 'pickup'>('home')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const deliveryFee = deliveryOption === 'home' ? DELIVERY_FEE : 0
  const grandTotal = totalPrice + deliveryFee

  if (items.length === 0) {
    router.replace('/cart')
    return null
  }

  async function handleConfirm() {
    if (deliveryOption === 'home' && !address.trim()) {
      toast.error('Please enter your delivery address')
      return
    }
    if (paymentMethod === 'bank_transfer' && !screenshot) {
      toast.error('Please upload your payment screenshot')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryOption,
          deliveryAddress: deliveryOption === 'home' ? address.trim() : undefined,
          paymentMethod,
          paymentScreenshot: paymentMethod === 'bank_transfer' ? screenshot : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to place order')
        return
      }

      clearCart()
      toast.success('Order placed successfully!')
      router.push(`/orders/${data.orderId}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24 sm:pb-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold text-neutral-800">Checkout</h1>

      {/* Order items summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Order Summary</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.product} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
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
                {(item.price * item.quantity).toLocaleString()} DA
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery option */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Delivery Option</h2>
        <div className="space-y-2">
          {[
            { value: 'home', label: 'Home Delivery', sub: `+${DELIVERY_FEE.toLocaleString()} DA` },
            { value: 'pickup', label: 'Store Pickup', sub: 'Free' },
          ].map(({ value, label, sub }) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                deliveryOption === value
                  ? 'border-brand-secondary bg-brand-light'
                  : 'border-neutral-200'
              }`}
            >
              <input
                type="radio"
                value={value}
                checked={deliveryOption === value}
                onChange={() => setDeliveryOption(value as 'home' | 'pickup')}
                className="accent-brand-primary"
              />
              <span className="text-sm font-medium text-neutral-700 flex-1">{label}</span>
              <span className="text-sm text-neutral-500">{sub}</span>
            </label>
          ))}
        </div>

        {deliveryOption === 'home' && (
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address…"
            rows={2}
            className="mt-3 w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary resize-none"
          />
        )}
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Payment Method</h2>
        <div className="space-y-2">
          {[
            { value: 'cash', label: 'Cash on Delivery / Pickup' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
          ].map(({ value, label }) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                paymentMethod === value
                  ? 'border-brand-secondary bg-brand-light'
                  : 'border-neutral-200'
              }`}
            >
              <input
                type="radio"
                value={value}
                checked={paymentMethod === value}
                onChange={() => setPaymentMethod(value as 'cash' | 'bank_transfer')}
                className="accent-brand-primary"
              />
              <span className="text-sm font-medium text-neutral-700">{label}</span>
            </label>
          ))}
        </div>

        {paymentMethod === 'bank_transfer' && (
          <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <p className="text-xs text-neutral-600">
              Transfer <strong>{grandTotal.toLocaleString()} DA</strong> using code{' '}
              <strong className="text-brand-primary">STORE-001</strong>, then upload your receipt.
            </p>
            {screenshot ? (
              <div className="flex items-center gap-2">
                <Image src={screenshot} alt="Receipt" width={60} height={60} className="rounded object-cover" />
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="paymentScreenshot"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) setScreenshot(res[0].ufsUrl)
                }}
                onUploadError={(err) => { toast.error(err.message) }}
              />
            )}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span>{totalPrice.toLocaleString()} DA</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? 'Free' : `${deliveryFee.toLocaleString()} DA`}</span>
        </div>
        <div className="border-t border-neutral-100 pt-2 flex justify-between font-bold text-neutral-800">
          <span>Total</span>
          <span>{grandTotal.toLocaleString()} DA</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-semibold text-base hover:bg-brand-secondary disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Placing order…' : 'Confirm Order'}
      </button>
    </div>
  )
}
