'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DeliveryDashboard() {
  const t = useTranslations('deliveryDashboard')
  const locale = useLocale()
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const { data, isLoading, mutate } = useSWR(
    `/api/delivery/orders?filter=${tab}`,
    fetcher,
    { refreshInterval: 20000 }
  )
  const { data: activeData } = useSWR('/api/delivery/orders?filter=active', fetcher, { refreshInterval: 20000 })
  const { data: completedData } = useSWR('/api/delivery/orders?filter=completed', fetcher)
  const orders = data?.orders ?? []

  async function markInTransit(orderId: string) {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'transit' }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('orderInTransit'))
      mutate()
    } catch {
      toast.error(t('updateError'))
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-headline-lg-mobile md:text-headline-lg text-neutral-800">{t('title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col gap-1">
          <Icon name="local_shipping" size={20} className="text-brand-primary" />
          <p className="text-headline-xl text-neutral-800">{activeData?.orders?.length ?? '…'}</p>
          <p className="text-label-sm text-neutral-500">{t('activeDeliveries')}</p>
        </div>
        <div className="bg-brand-container/20 rounded-2xl border border-brand-primary/20 p-5 flex flex-col gap-1">
          <Icon name="task_alt" size={20} className="text-brand-primary" />
          <p className="text-headline-xl text-brand-primary">{completedData?.orders?.length ?? '…'}</p>
          <p className="text-label-sm text-brand-secondary">{t('completed')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'completed'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 rounded-full text-label-lg capitalize transition ${
              tab === tabKey
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-brand-primary'
            }`}
          >
            {tabKey === 'active' ? t('active') : t('completed')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 animate-pulse space-y-3">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
              <div className="h-9 bg-neutral-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">
          <Icon name="local_shipping" size={40} className="mx-auto mb-3 opacity-40" />
          <p>{tab === 'active' ? t('noActiveOrders') : t('noCompletedOrders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const mapsUrl = order.deliveryAddress
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`
              : null
            return (
              <div key={order._id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="flex gap-3 px-4 pt-4 pb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                    {order.deliveryOption === 'pickup' ? (
                      <Icon name="store" size={20} className="text-brand-primary" />
                    ) : (
                      <Icon name="local_shipping" size={20} className="text-brand-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-body-lg font-bold text-neutral-800 truncate">{order.customer?.name}</p>
                      <StatusBadge status={order.status as OrderStatus} />
                    </div>
                    <p className="text-label-sm text-neutral-400">
                      {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                      {' · '}{t('itemCount', { count: order.items?.length ?? 0 })}
                      {' · '}<span className="font-medium text-neutral-600">{order.grandTotal?.toLocaleString()} MRU</span>
                    </p>
                  </div>
                </div>

                {/* Customer info */}
                <div className="px-4 py-2 space-y-1.5 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-body-md text-neutral-600">
                    <Icon name="call" size={14} className="text-neutral-400 shrink-0" />
                    <a href={`tel:${order.customer?.phone}`} className="text-brand-primary hover:underline">
                      {order.customer?.phone}
                    </a>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-start justify-between gap-2 text-body-md text-neutral-600">
                      <div className="flex items-start gap-2">
                        <Icon name="location_on" size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-label-sm text-brand-primary shrink-0"
                        >
                          <Icon name="navigation" size={14} /> {t('navigate')}
                        </a>
                      )}
                    </div>
                  )}
                  {order.deliveryOption === 'pickup' && (
                    <div className="flex items-center gap-2 text-body-md text-neutral-500">
                      <Icon name="location_on" size={14} className="text-neutral-400" />
                      <span>{t('storePickup')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-2 flex gap-2">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => markInTransit(order._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-label-lg bg-brand-primary text-white hover:bg-brand-secondary transition"
                    >
                      <Icon name="local_shipping" size={18} />
                      {t('markInTransit')}
                    </button>
                  )}
                  {order.status === 'transit' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-label-lg bg-brand-container/15 text-brand-primary">
                      <Icon name="timer" size={18} />
                      {t('awaitingConfirmation')}
                    </div>
                  )}
                  <Link
                    href={`/delivery/orders/${order._id}`}
                    className="flex items-center justify-center w-10 h-10 border border-neutral-200 rounded-lg text-neutral-400 hover:text-brand-primary hover:border-brand-primary transition"
                    title={t('viewDetailsAria')}
                  >
                    <Icon name="chevron_right" size={18} className="rtl:rotate-180" />
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
