'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, ChevronRight, Truck, CheckCircle } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const NEXT_ACTION: Record<string, { label: string; status: 'transit' | 'delivered'; icon: React.ElementType }> = {
  confirmed: { label: 'Mark In Transit', status: 'transit', icon: Truck },
  transit:   { label: 'Mark Delivered',  status: 'delivered', icon: CheckCircle },
}

export default function DeliveryDashboard() {
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const { data, isLoading, mutate } = useSWR(
    `/api/delivery/orders?filter=${tab}`,
    fetcher,
    { refreshInterval: 20000 }
  )
  const orders = data?.orders ?? []

  async function updateStatus(orderId: string, status: 'transit' | 'delivered') {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'delivered' ? 'Order marked as delivered!' : 'Order in transit')
      mutate()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-bold text-neutral-800">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-secondary'
            }`}
          >
            {t === 'active' ? 'Active' : 'Completed'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse space-y-3">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
              <div className="h-9 bg-neutral-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
          <Truck size={36} className="mx-auto mb-3 opacity-40" />
          <p>{tab === 'active' ? 'No active orders assigned to you' : 'No completed orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const action = NEXT_ACTION[order.status]
            return (
              <div key={order._id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-4 pt-4 pb-2">
                  <div>
                    <p className="text-sm font-bold text-neutral-800">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short',
                      })}
                      {' · '}
                      {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                      {' · '}
                      <span className="font-medium text-neutral-600">{order.grandTotal?.toLocaleString()} DA</span>
                    </p>
                  </div>
                  <StatusBadge status={order.status as OrderStatus} />
                </div>

                {/* Customer info */}
                <div className="px-4 py-2 space-y-1.5 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone size={14} className="text-neutral-400 flex-shrink-0" />
                    <span className="font-medium">{order.customer?.name}</span>
                    <a
                      href={`tel:${order.customer?.phone}`}
                      className="text-brand-secondary hover:underline"
                    >
                      {order.customer?.phone}
                    </a>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <MapPin size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  )}
                  {order.deliveryOption === 'pickup' && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <MapPin size={14} className="text-neutral-400" />
                      <span>Store pickup</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-2 flex gap-2">
                  {action && (
                    <button
                      onClick={() => updateStatus(order._id, action.status)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                        action.status === 'delivered'
                          ? 'bg-success text-white hover:opacity-90'
                          : 'bg-brand-primary text-white hover:bg-brand-secondary'
                      }`}
                    >
                      <action.icon size={16} />
                      {action.label}
                    </button>
                  )}
                  <Link
                    href={`/delivery/orders/${order._id}`}
                    className="flex items-center justify-center w-10 h-10 border border-neutral-200 rounded-lg text-neutral-400 hover:text-brand-primary hover:border-brand-secondary transition"
                    title="View details"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
