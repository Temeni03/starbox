'use client'

import Link from 'next/link'
import { Gift } from 'lucide-react'
import type { Box } from '@/hooks/useBoxes'

export function BoxCard({ box }: { box: Box }) {
  return (
    <Link href={`/offers/${box._id}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container shadow-[0_10px_25px_-5px_rgba(216,150,255,0.25),0_8px_10px_-6px_rgba(216,150,255,0.15)] flex items-center justify-center">
        <Gift size={40} className="text-white/90 group-hover:scale-105 transition-transform duration-500" />
      </div>

      <h3 className="text-base font-semibold text-neutral-800 truncate mb-1">
        {box.name}
      </h3>
      <div className="mt-auto">
        <span className="text-base font-semibold text-brand-primary">
          {box.price.toLocaleString()} MRU
        </span>
      </div>
    </Link>
  )
}
