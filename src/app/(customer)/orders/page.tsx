'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ClipboardList, ChevronRight, Package } from 'lucide-react'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const FILTER_KEYS = ['all', 'active', 'delivered', 'cancelled'] as const

type FilterKey = (typeof FILTER_KEYS)[number]

function matchesFilter(status: OrderStatus, filter: FilterKey) {
  if (filter === 'all') return true
  if (filter === 'active') return status === 'pending' || status === 'confirmed' || status === 'transit'
  return status === filter
}

export default function OrdersPage() {
  const t = useTranslations('orders')
  const locale = useLocale()
  const { data, isLoading } = useSWR('/api/orders', fetcher)
  const orders = data?.orders ?? []
  const [filter, setFilter] = useState<FilterKey>('all')

  const filteredOrders = orders.filter((order: any) => matchesFilter(order.status, filter))

  if (isLoading) {
    return (
      <div className="space-y-3 pb-20 sm:pb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 animate-pulse">
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
        <ClipboardList size={40} className="mb-4 opacity-50" />
        <p className="text-lg font-semibold">{t('empty')}</p>
        <Link href="/" className="mt-4 text-sm text-brand-secondary hover:underline">
          {t('startShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [scrollbar-width:none]">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition active:scale-95 ${
              filter === key ? 'bg-brand-primary text-white' : 'bg-surface-high text-neutral-500'
            }`}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">{t('emptyCategory')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => {
            const thumbs = (order.items ?? []).slice(0, 3)
            const extra = (order.items?.length ?? 0) - thumbs.length
            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400">{order.orderNumber}</p>
                    <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(locale, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={order.status as OrderStatus} />
                    <ChevronRight size={16} className="text-neutral-300" />
                  </div>
                </div>

                {thumbs.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {thumbs.map((item: any, idx: number) => (
                      <div key={idx} className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-high">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                            <Package size={18} />
                          </div>
                        )}
                      </div>
                    ))}
                    {extra > 0 && (
                      <div className="shrink-0 w-14 h-14 rounded-lg bg-surface-high border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-500">
                        +{extra}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                  <span className="text-sm text-neutral-500">
                    {t('totalItems', { count: order.items?.length ?? 0 })}
                  </span>
                  <span className="text-base font-bold text-brand-primary">
                    {order.grandTotal?.toLocaleString()} MRU
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
