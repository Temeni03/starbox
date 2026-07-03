'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUSES = ['all', 'pending', 'confirmed', 'transit', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('status') ?? 'all'

  const { data, isLoading } = useSWR(
    `/api/admin/orders?status=${status}&limit=30`,
    fetcher,
    { refreshInterval: 15000 }
  )
  const orders = data?.orders ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-800">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/admin/orders${s !== 'all' ? `?status=${s}` : ''}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
              status === s
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-secondary'
            }`}
          >
            {s === 'transit' ? 'In Transit' : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-32" />
                  <div className="h-3 bg-neutral-100 rounded w-24" />
                </div>
                <div className="h-6 bg-neutral-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No orders found</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.map((order: any) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-800">{order.orderNumber}</p>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {order.customer?.name} · {order.customer?.phone}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-sm font-bold text-neutral-700">
                    {order.grandTotal?.toLocaleString()} MRU
                  </p>
                  <ChevronRight size={16} className="text-neutral-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
