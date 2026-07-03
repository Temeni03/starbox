'use client'

import Link from 'next/link'
import { ShoppingBag, Package, Truck, AlertTriangle } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  href?: string
}) {
  const inner = (
    <div className={`bg-white rounded-xl border border-neutral-200 p-5 flex items-center gap-4 ${href ? 'hover:shadow-md transition cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
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
  const { data, isLoading } = useSWR('/api/admin/stats', fetcher, { refreshInterval: 30000 })
  const { data: ordersData } = useSWR('/api/admin/orders?limit=5', fetcher)

  const stats = data ?? {}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={isLoading ? '…' : stats.totalOrders ?? 0}
          icon={ShoppingBag}
          color="bg-brand-primary"
          href="/admin/orders"
        />
        <StatCard
          label="Total Products"
          value={isLoading ? '…' : stats.totalProducts ?? 0}
          icon={Package}
          color="bg-brand-secondary"
          href="/admin/products"
        />
        <StatCard
          label="Livreurs"
          value={isLoading ? '…' : stats.totalDelivery ?? 0}
          icon={Truck}
          color="bg-status-pending"
        />
        <StatCard
          label="Low Stock"
          value={isLoading ? '…' : stats.lowStockProducts ?? 0}
          icon={AlertTriangle}
          color="bg-danger"
          href="/admin/products"
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-700">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-secondary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {ordersData?.orders?.filter((order: any) => order.status !== 'delivered').length === 0 && (
            <p className="px-5 py-8 text-center text-neutral-400 text-sm">No orders yet</p>
          )}
          {ordersData?.orders?.filter((order: any) => order.status !== 'delivered').map((order: any) => (
            <Link
              key={order._id}
              href={`/admin/orders/${order._id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{order.orderNumber}</p>
                <p className="text-xs text-neutral-400">{order.customer?.name} · {order.customer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-700">{order.grandTotal?.toLocaleString()} MRU</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'transit' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
