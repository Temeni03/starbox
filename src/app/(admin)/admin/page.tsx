'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShoppingBag, Package, Truck, AlertTriangle, ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  alert,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  href?: string
  alert?: boolean
}) {
  const inner = (
    <div
      className={`bg-white/70 backdrop-blur-md border rounded-2xl p-5 flex flex-col gap-3 transition ${
        href ? 'hover:shadow-md cursor-pointer' : ''
      } ${alert ? 'border-l-4 border-l-danger border-y border-r border-brand-light/60' : 'border-brand-light/60'}`}
    >
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${alert ? 'bg-danger/10' : 'bg-brand-primary/10'}`}>
        <Icon size={20} className={alert ? 'text-danger' : 'text-brand-primary'} />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const t = useTranslations('adminDashboard')
  const router = useRouter()
  const { data, isLoading } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 30000 })
  const { data: ordersData } = useSWR('/api/admin/orders?limit=5', fetcher)

  const stats = data ?? {}
  const recentOrders = ordersData?.orders?.filter((order: any) => order.status !== 'delivered') ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('totalOrders')} value={isLoading ? '…' : stats.totalOrders ?? 0} icon={ShoppingBag} href="/admin/orders" />
        <KpiCard label={t('totalProducts')} value={isLoading ? '…' : stats.totalProducts ?? 0} icon={Package} href="/admin/products" />
        <KpiCard label={t('deliveryStaff')} value={isLoading ? '…' : stats.totalDelivery ?? 0} icon={Truck} href="/admin/users" />
        <KpiCard
          label={t('lowStockAlerts')}
          value={isLoading ? '…' : stats.lowStockProducts ?? 0}
          icon={AlertTriangle}
          href="/admin/products"
          alert={!isLoading && stats.lowStockProducts > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Recent Orders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-800">{t('recentOrders')}</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-primary hover:underline">
              {t('viewAll')}
            </Link>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl overflow-hidden">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-neutral-400 text-sm">{t('noActiveOrders')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low/60">
                      <th className="p-4 text-xs font-semibold text-neutral-500">{t('colOrder')}</th>
                      <th className="p-4 text-xs font-semibold text-neutral-500">{t('colCustomer')}</th>
                      <th className="p-4 text-xs font-semibold text-neutral-500">{t('colStatus')}</th>
                      <th className="p-4 text-xs font-semibold text-neutral-500 text-right">{t('colTotal')}</th>
                      <th className="p-4 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {recentOrders.map((order: any) => (
                      <tr
                        key={order._id}
                        className="hover:bg-brand-light/20 transition cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                      >
                        <td className="p-4 text-sm font-medium text-neutral-800">{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-neutral-700">{order.customer?.name}</span>
                            <span className="text-xs text-neutral-400">{order.customer?.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status as OrderStatus} />
                        </td>
                        <td className="p-4 text-right text-sm font-semibold text-neutral-700">
                          {order.grandTotal?.toLocaleString()} MRU
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight size={16} className="text-neutral-300" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
