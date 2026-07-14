'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import useSWR from 'swr'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { OrderStatus } from '@/models/Order'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function KpiCard({
  label,
  value,
  icon,
  href,
  alert,
}: {
  label: string
  value: string | number
  icon: string
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
        <Icon name={icon} size={20} className={alert ? 'text-danger' : 'text-brand-primary'} />
      </div>
      <div>
        <p className="text-headline-xl text-neutral-800">{value}</p>
        <p className="text-label-sm text-neutral-500">{label}</p>
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
      <h1 className="text-headline-lg-mobile md:text-headline-lg text-neutral-800">{t('title')}</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('totalOrders')} value={isLoading ? '…' : stats.totalOrders ?? 0} icon="shopping_bag" href="/admin/orders" />
        <KpiCard label={t('totalProducts')} value={isLoading ? '…' : stats.totalProducts ?? 0} icon="package_2" href="/admin/products" />
        <KpiCard label={t('deliveryStaff')} value={isLoading ? '…' : stats.totalDelivery ?? 0} icon="local_shipping" href="/admin/users" />
        <KpiCard
          label={t('lowStockAlerts')}
          value={isLoading ? '…' : stats.lowStockProducts ?? 0}
          icon="warning"
          href="/admin/products"
          alert={!isLoading && stats.lowStockProducts > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Recent Orders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md text-neutral-800">{t('recentOrders')}</h2>
            <Link href="/admin/orders" className="text-label-lg text-brand-primary hover:underline">
              {t('viewAll')}
            </Link>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/60 rounded-2xl overflow-hidden">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-neutral-400 text-body-md">{t('noActiveOrders')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low/60">
                      <th className="p-4 text-label-sm text-neutral-500">{t('colOrder')}</th>
                      <th className="p-4 text-label-sm text-neutral-500">{t('colCustomer')}</th>
                      <th className="p-4 text-label-sm text-neutral-500">{t('colStatus')}</th>
                      <th className="p-4 text-label-sm text-neutral-500 text-right">{t('colTotal')}</th>
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
                        <td className="p-4 text-label-lg text-neutral-800">{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-body-md text-neutral-700">{order.customer?.name}</span>
                            <span className="text-label-sm text-neutral-400">{order.customer?.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status as OrderStatus} />
                        </td>
                        <td className="p-4 text-right text-label-sm font-bold text-neutral-700">
                          {order.grandTotal?.toLocaleString()} MRU
                        </td>
                        <td className="p-4 text-right">
                          <Icon name="chevron_right" size={16} className="text-neutral-300" />
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
