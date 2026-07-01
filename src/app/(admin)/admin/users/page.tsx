'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, User } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminUsersPage() {
  const [tab, setTab] = useState<'customer' | 'delivery'>('customer')
  const { data, isLoading } = useSWR(`/api/admin/users?role=${tab}`, fetcher)
  const users = data?.users ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Users</h1>
        {tab === 'delivery' && (
          <Link
            href="/admin/users/new-delivery"
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-secondary transition"
          >
            <Plus size={16} />
            Add Delivery
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['customer', 'delivery'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-secondary'
            }`}
          >
            {t === 'customer' ? 'Customers' : 'Delivery Staff'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                <div className="w-9 h-9 bg-neutral-100 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="px-5 py-12 text-center text-neutral-400">No {tab} users yet</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">{u.name}</p>
                  <p className="text-xs text-neutral-400">{u.phone}</p>
                  {u.address && (
                    <p className="text-xs text-neutral-400 truncate">{u.address}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-neutral-400">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                  {!u.isActive && (
                    <span className="text-xs text-danger">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
