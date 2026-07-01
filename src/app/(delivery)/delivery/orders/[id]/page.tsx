'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Package, Truck, CheckCircle } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher)
  const [updating, setUpdating] = useState(false)

  const order = data?.order

  async function updateStatus(status: 'transit' | 'delivered') {
    setUpdating(true)
    try {
      const res = await fetch(`/api/delivery/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'delivered' ? 'Order delivered!' : 'Marked in transit')
      mutate()
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/4" />
        <div className="h-40 bg-white rounded-xl border border-neutral-200" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400">
        Order not found.{' '}
        <Link href="/delivery" className="text-brand-secondary hover:underline">Back</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <Link href="/delivery" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-neutral-800">{order.orderNumber}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">Customer</h2>
        <div className="flex items-center gap-2">
          <Phone size={15} className="text-neutral-400" />
          <span className="text-sm font-medium">{order.customer?.name}</span>
          <a
            href={`tel:${order.customer?.phone}`}
            className="text-sm text-brand-secondary hover:underline font-medium"
          >
            {order.customer?.phone}
          </a>
        </div>
        {order.deliveryOption === 'home' && order.deliveryAddress && (
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-neutral-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-neutral-700">{order.deliveryAddress}</p>
          </div>
        )}
        {order.deliveryOption === 'pickup' && (
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-neutral-400" />
            <p className="text-sm text-neutral-500">Store pickup</p>
          </div>
        )}
        <div className="pt-1 text-sm">
          <span className="text-neutral-500">Payment: </span>
          <span className="font-medium text-neutral-700">
            {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Bank transfer (paid)'}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">
          Items ({order.items?.length})
        </h2>
        <div className="space-y-3">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="44px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                    <Package size={14} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 truncate">{item.name}</p>
                <p className="text-xs text-neutral-400">× {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-neutral-600">
                {(item.price * item.quantity).toLocaleString()} DA
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-100 mt-3 pt-3 flex justify-between font-bold text-neutral-800">
          <span>Total</span>
          <span>{order.grandTotal?.toLocaleString()} DA</span>
        </div>
      </div>

      {/* Action buttons */}
      {order.status === 'confirmed' && (
        <button
          onClick={() => updateStatus('transit')}
          disabled={updating}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3.5 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
        >
          <Truck size={18} />
          {updating ? 'Updating…' : 'Mark In Transit'}
        </button>
      )}
      {order.status === 'transit' && (
        <button
          onClick={() => updateStatus('delivered')}
          disabled={updating}
          className="w-full flex items-center justify-center gap-2 bg-success text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition"
        >
          <CheckCircle size={18} />
          {updating ? 'Updating…' : 'Mark Delivered'}
        </button>
      )}
    </div>
  )
}
