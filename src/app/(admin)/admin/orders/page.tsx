'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUSES = ['all', 'pending', 'confirmed', 'transit', 'delivered', 'cancelled']

const NEXT_STEP: Partial<Record<OrderStatus, string>> = {
  pending: 'Next step: verify payment and confirm',
  confirmed: 'Next step: assign a delivery person',
  transit: 'Next step: confirm delivery',
}

export default function AdminOrdersPage() {
  const t = useTranslations('adminOrders')
  const tStatus = useTranslations('status')
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('status') ?? 'all'

  const { data, isLoading, mutate } = useSWR(
    `/api/admin/orders?status=${status}&limit=30`,
    fetcher,
    { refreshInterval: 15000 }
  )
  const orders = data?.orders ?? []

  async function updateStatus(orderId: string, newStatus: OrderStatus, label: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(label)
      mutate()
    } catch {
      toast.error(t('updateError'))
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-headline-lg-mobile md:text-headline-lg text-neutral-800">{t('title')}</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/admin/orders${s !== 'all' ? `?status=${s}` : ''}`)}
            className={`px-4 py-1.5 rounded-full text-label-sm capitalize transition ${
              status === s
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-brand-primary'
            }`}
          >
            {s === 'all' ? t('allStatus') : tStatus(s as OrderStatus)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 animate-pulse space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="bg-white rounded-2xl border border-neutral-200 px-5 py-12 text-center text-neutral-400 text-body-md">{t('noOrders')}</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const isTerminal = order.status === 'delivered' || order.status === 'cancelled'
            return (
              <div
                key={order._id}
                className={`bg-white rounded-2xl border border-neutral-200 p-4 transition ${isTerminal ? 'opacity-75' : 'hover:shadow-md'}`}
              >
                <Link href={`/admin/orders/${order._id}`} className="flex justify-between items-start mb-3 group">
                  <div className="min-w-0">
                    <p className="text-label-sm text-neutral-400">{order.orderNumber}</p>
                    <h3 className="text-body-lg font-bold text-neutral-800 group-hover:text-brand-primary transition truncate">
                      {order.customer?.name}
                    </h3>
                    <p className="text-label-sm text-neutral-400">{order.customer?.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-body-lg font-bold text-brand-primary">
                      {order.grandTotal?.toLocaleString()} MRU
                    </span>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                </Link>

                {/* Payment proof (pending + bank transfer) */}
                {order.status === 'pending' && order.paymentMethod === 'bank_transfer' && order.paymentScreenshot && (
                  <div className="flex gap-3 mb-3 items-center bg-surface-low p-2 rounded-lg">
                    <a
                      href={order.paymentScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0"
                    >
                      <Image src={order.paymentScreenshot} alt="Payment receipt" fill className="object-cover" sizes="56px" />
                    </a>
                    <div className="flex flex-col">
                      <span className="text-label-sm font-semibold text-neutral-700">{t('paymentReceipt')}</span>
                      <span className="text-label-sm text-neutral-400">{t('bankTransferSubmitted')}</span>
                    </div>
                  </div>
                )}

                {/* Assigned driver (confirmed / transit) */}
                {(order.status === 'confirmed' || order.status === 'transit') && (
                  <div className="flex items-center justify-between bg-brand-container/10 p-3 rounded-lg border border-brand-container/20 mb-3">
                    <span className="text-body-md text-brand-secondary font-medium">
                      {order.assignedTo ? t('assignedTo', { name: order.assignedTo.name }) : t('noDriverAssigned')}
                    </span>
                    {!order.assignedTo && (
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="flex items-center gap-1 bg-brand-secondary text-white px-3 py-1.5 rounded-full text-label-sm active:scale-95 transition"
                      >
                        <Icon name="person_add" size={14} />
                        {t('assign')}
                      </Link>
                    )}
                  </div>
                )}

                {/* Quick actions */}
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(order._id, 'confirmed', t('orderConfirmed'))}
                      className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-brand-primary text-white rounded-xl text-label-lg active:scale-95 transition"
                    >
                      <Icon name="verified" size={18} /> {t('approve')}
                    </button>
                    <button
                      onClick={() => updateStatus(order._id, 'cancelled', t('orderRejected'))}
                      className="flex-1 h-10 flex items-center justify-center gap-1.5 border border-neutral-300 text-neutral-600 rounded-xl text-label-lg active:scale-95 transition"
                    >
                      <Icon name="cancel" size={18} /> {t('reject')}
                    </button>
                  </div>
                )}
                {order.status === 'transit' && (
                  <button
                    onClick={() => updateStatus(order._id, 'delivered', t('orderDelivered'))}
                    className="w-full h-10 flex items-center justify-center gap-1.5 bg-brand-primary text-white rounded-xl text-label-lg active:scale-95 transition"
                  >
                    <Icon name="local_shipping" size={18} /> {t('confirmDelivery')}
                  </button>
                )}
                {isTerminal && NEXT_STEP[order.status as OrderStatus] === undefined && (
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="flex items-center gap-1 text-label-sm text-neutral-400 hover:text-brand-primary transition"
                  >
                    {t('viewDetails')} <Icon name="chevron_right" size={14} className="rtl:rotate-180" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
