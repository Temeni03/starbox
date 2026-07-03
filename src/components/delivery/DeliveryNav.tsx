'use client'

import Link from 'next/link'
import { User, Truck } from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'

export function DeliveryNav({ userName }: { userName: string }) {
  return (
    <header className="bg-brand-primary text-white sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-2xl h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Truck size={20} />
            <span className="font-bold text-lg">Delivery</span>
          </div>
          <NotificationBell href="/delivery/notifications" className="text-white/70 hover:text-white transition" />
        </div>
        <Link
          href="/delivery/profile"
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
        >
          <span className="hidden sm:block">{userName}</span>
          <User size={20} />
        </Link>
      </div>
    </header>
  )
}
