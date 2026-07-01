'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Truck } from 'lucide-react'

export function DeliveryNav({ userName }: { userName: string }) {
  return (
    <header className="bg-brand-primary text-white sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-2xl h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={20} />
          <span className="font-bold text-lg">Delivery</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70 hidden sm:block">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
