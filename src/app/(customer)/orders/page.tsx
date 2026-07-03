'use client'

import Link from 'next/link'
import { ClipboardList, ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function OrdersPage() {
  const { data, isLoading } = useSWR('/api/orders', fetcher)
  const orders = data?.orders ?? []

  if (isLoading) {
    return (
      <div className="space-y-3 pb-20 sm:pb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <ClipboardList size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">No orders yet</p>
        <Link href="/" className="mt-4 text-sm text-brand-secondary hover:underline">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="text-xl font-bold text-neutral-800 mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order: any) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="block bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800">{order.orderNumber}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {' · '}
                  {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={order.status as OrderStatus} />
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </div>
            <div className="mt-2 text-sm font-bold text-brand-primary">
              {order.grandTotal?.toLocaleString()} MRU
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
