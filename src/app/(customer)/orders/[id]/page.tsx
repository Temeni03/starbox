'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle2, Clock, PartyPopper, XCircle } from 'lucide-react'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'transit', 'delivered']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('orderDetail')
  const tCommon = useTranslations('common')
  const tCheckout = useTranslations('checkout')
  const tStatus = useTranslations('status')
  const locale = useLocale()
  const { data, isLoading } = useSWR(`/api/orders/${id}`, fetcher)
  const order = data?.order

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20 sm:pb-6 animate-pulse">
        <div className="h-6 bg-neutral-100 rounded w-1/3" />
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="h-4 bg-neutral-100 rounded w-1/2" />
          <div className="h-4 bg-neutral-100 rounded w-1/4" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-neutral-400 pb-24 sm:pb-6">
        <p>{t('notFound')}</p>
        <Link href="/orders" className="mt-2 text-sm text-brand-secondary hover:underline block">
          {t('backToOrders')}
        </Link>
      </div>
    )
  }

  const currentStepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const isFresh = order.status === 'pending'

  return (
    <div className="pb-24 sm:pb-6 space-y-4 max-w-lg mx-auto">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-primary transition">
        <ArrowLeft size={16} /> {t('backToOrders')}
      </Link>

      {isFresh ? (
        <div className="text-center py-4">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-brand-container/30 blur-3xl rounded-full scale-150" />
            <div className="relative w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg">
              <PartyPopper size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-1">{t('thankYou')}</h2>
          <p className="text-sm text-neutral-500">{t('thankYouDesc')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-neutral-800">{order.orderNumber}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString(locale, {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <StatusBadge status={order.status as OrderStatus} />
          </div>
        </div>
      )}

      {isFresh && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{t('orderId')}</span>
            <span className="text-lg font-bold text-brand-primary">{order.orderNumber}</span>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{tCommon('delivery')}</span>
            <span className="text-lg font-bold text-brand-primary">
              {order.deliveryOption === 'home' ? tCommon('home') : tCommon('pickup')}
            </span>
          </div>
        </div>
      )}

      {/* Status timeline */}
      {isCancelled ? (
        <div className="bg-status-cancelled/10 border border-status-cancelled/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-status-cancelled shrink-0" />
          <p className="text-sm text-status-cancelled font-medium">{t('cancelled')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">{t('progress')}</h2>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-0 w-full h-0.5 bg-neutral-200 z-0" />
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx
              const active = idx === currentStepIdx
              return (
                <div key={step} className="relative z-10 flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    done ? 'bg-brand-primary' : 'bg-neutral-200'
                  }`}>
                    {done
                      ? <CheckCircle2 size={16} className="text-white" />
                      : <Clock size={16} className="text-neutral-400" />
                    }
                  </div>
                  <span className={`text-[10px] text-center capitalize ${active ? 'text-brand-primary font-semibold' : 'text-neutral-400'}`}>
                    {tStatus(step)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">{t('items')}</h2>
        <div className="space-y-3">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-surface-high rounded-lg overflow-hidden shrink-0">
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
                <p className="text-xs text-neutral-400">× {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString()} MRU</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Payment */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-neutral-600">
              {order.deliveryOption === 'home' ? tCheckout('homeDelivery') : tCheckout('storePickup')}
            </p>
            {order.deliveryAddress && (
              <p className="text-xs text-neutral-500 mt-0.5">{order.deliveryAddress}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-neutral-400 shrink-0" />
          <p className="text-xs font-medium text-neutral-600">
            {order.paymentMethod === 'cash' ? tCheckout('cashOnDelivery') : tCheckout('bankTransfer')}
          </p>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white/70 backdrop-blur-md border-2 border-brand-container/20 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>{tCommon('subtotal')}</span>
          <span>{order.cartTotal?.toLocaleString()} MRU</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>{t('deliveryLabel')}</span>
          <span>{order.deliveryFee === 0 ? tCommon('free') : `${order.deliveryFee?.toLocaleString()} MRU`}</span>
        </div>
        <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
          <span className="text-lg font-semibold text-neutral-800">{tCommon('total')}</span>
          <span className="text-2xl font-bold text-brand-primary">{order.grandTotal?.toLocaleString()} MRU</span>
        </div>
      </div>

      {isFresh && (
        <Link
          href="/"
          className="block w-full text-center h-12 leading-12 bg-brand-primary text-white rounded-full text-sm font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary active:scale-95 transition-all"
        >
          {t('continueShopping')}
        </Link>
      )}
    </div>
  )
}
