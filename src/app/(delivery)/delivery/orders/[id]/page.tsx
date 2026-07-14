'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowLeft, MapPin, Phone, Package, Truck, CreditCard, Banknote, Navigation, Info, Hourglass } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('deliveryOrderDetail')
  const tCommon = useTranslations('common')
  const { data, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher)
  const [updating, setUpdating] = useState(false)

  const order = data?.order

  async function updateStatus(status: 'transit') {
    setUpdating(true)
    try {
      const res = await fetch(`/api/delivery/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('markedInTransit'))
      mutate()
    } catch {
      toast.error(t('updateError'))
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/4" />
        <div className="h-40 bg-white rounded-2xl border border-neutral-200" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400">
        {t('notFound')}{' '}
        <Link href="/delivery" className="text-brand-secondary hover:underline">{t('back')}</Link>
      </div>
    )
  }

  const mapsUrl = order.deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`
    : null

  return (
    <div className="space-y-4 pb-32">
      <Link href="/delivery" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> {t('back')}
      </Link>

      <div className="flex justify-center">
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      {/* Customer */}
      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-primary">{t('customer')}</h2>
          <p className="text-xs text-neutral-400">{order.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-neutral-500">{t('name')}</p>
            <p className="text-sm font-semibold text-neutral-800">{order.customer?.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-neutral-500">{t('phone')}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-neutral-800">{order.customer?.phone}</p>
              <a
                href={`tel:${order.customer?.phone}`}
                className="bg-brand-container/20 p-1.5 rounded-lg text-brand-primary"
              >
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>

        {order.deliveryOption === 'home' && order.deliveryAddress ? (
          <div className="space-y-1">
            <p className="text-xs text-neutral-500">{t('deliveryAddress')}</p>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-brand-primary mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700 leading-relaxed">{order.deliveryAddress}</p>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 shrink-0 px-3 py-1.5 bg-white rounded-full border border-brand-container/40 text-brand-primary text-xs font-semibold"
                >
                  <Navigation size={13} /> {t('navigate')}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-neutral-400" />
            <p className="text-sm text-neutral-500">{t('storePickup')}</p>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-semibold text-brand-primary">{t('paymentStatus')}</h2>
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-low border border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand-container/20 text-brand-primary">
              {order.paymentMethod === 'cash' ? <Banknote size={18} /> : <CreditCard size={18} />}
            </div>
            <p className="text-sm font-semibold text-neutral-800">
              {order.paymentMethod === 'cash' ? t('cashOnDelivery') : t('bankTransfer')}
            </p>
          </div>
          <p className="text-lg font-bold text-brand-primary">{order.grandTotal?.toLocaleString()} MRU</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-high/60">
          <Info size={16} className="text-brand-primary shrink-0" />
          <p className="text-xs text-neutral-500">
            {order.paymentMethod === 'cash' ? t('collectCash') : t('noCashNeeded')}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-base font-semibold text-neutral-800 mb-3">
          {t('orderItems', { count: order.items?.length ?? 0 })}
        </h2>
        <div className="space-y-3">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-16 h-16 bg-surface-high rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                    <Package size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-brand-primary font-medium">{t('qty', { count: item.quantity })}</span>
                  <span className="text-sm font-bold text-neutral-700">
                    {(item.price * item.quantity).toLocaleString()} MRU
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 mt-4 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{tCommon('subtotal')}</span><span>{order.cartTotal?.toLocaleString()} MRU</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{tCommon('delivery')}</span>
            <span>{order.deliveryFee === 0 ? tCommon('free') : `${order.deliveryFee?.toLocaleString()} MRU`}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-semibold text-neutral-800">{t('totalAmount')}</span>
            <span className="text-lg font-bold text-brand-primary">{order.grandTotal?.toLocaleString()} MRU</span>
          </div>
        </div>
      </div>

      {/* Sticky action */}
      {order.status === 'confirmed' && (
        <div className="fixed bottom-16 sm:bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-neutral-200/60 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => updateStatus('transit')}
              disabled={updating}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white h-12 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-60 transition"
            >
              <Truck size={18} />
              {updating ? t('updating') : t('markInTransit')}
            </button>
          </div>
        </div>
      )}

      {order.status === 'transit' && (
        <div className="bg-brand-container/10 border border-brand-container/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-container/20 text-brand-primary flex items-center justify-center shrink-0">
            <Hourglass size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">{t('awaitingConfirmation')}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{t('awaitingConfirmationDesc')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
