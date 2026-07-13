'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gift } from 'lucide-react'
import { useBoxes } from '@/hooks/useBoxes'

export function OfferCarousel() {
  const { boxes, isLoading } = useBoxes()

  if (isLoading) {
    return <div className="mb-8 rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-surface-high animate-pulse" />
  }

  if (boxes.length === 0) {
    return (
      <div className="mb-8 relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container flex items-center justify-center">
        <Gift size={48} className="text-white/60" />
      </div>
    )
  }

  return (
    <div className="mb-8 relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9]">
      <div className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {boxes.map((box, i) => (
          <Link
            key={box._id}
            href={`/offers/${box._id}`}
            className="relative h-full w-full shrink-0 snap-center bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container"
          >
            {box.coverImage ? (
              <Image
                src={box.coverImage}
                alt={box.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gift size={48} className="text-white/90" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
