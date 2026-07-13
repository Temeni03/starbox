'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gift } from 'lucide-react'
import { useBoxes } from '@/hooks/useBoxes'

export function OfferCarousel() {
  const { boxes, isLoading } = useBoxes()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const showPeek = boxes.length > 1

  useEffect(() => {
    const track = trackRef.current
    if (!track || !showPeek) return

    function updateActiveIndex() {
      const slides = Array.from(track!.children) as HTMLElement[]
      if (slides.length === 0) return
      const trackCenter = track!.scrollLeft + track!.clientWidth / 2
      let closest = 0
      let closestDistance = Infinity
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
        const distance = Math.abs(slideCenter - trackCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = i
        }
      })
      setActiveIndex(closest)
    }

    let raf = 0
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateActiveIndex)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    updateActiveIndex()
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [showPeek, boxes.length])

  function scrollToIndex(i: number) {
    const track = trackRef.current
    const slide = track?.children[i] as HTMLElement | undefined
    if (!track || !slide) return
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }

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
    <div className="mb-8">
      <div
        ref={trackRef}
        className={`flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          showPeek ? 'px-[4%]' : ''
        }`}
      >
        {boxes.map((box, i) => (
          <Link
            key={box._id}
            href={`/offers/${box._id}`}
            className={`relative shrink-0 snap-center aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container ${
              showPeek ? 'w-[92%]' : 'w-full'
            }`}
          >
            {box.coverImage ? (
              <Image
                src={box.coverImage}
                alt={box.name}
                fill
                className="object-cover"
                sizes="92vw"
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

      {showPeek && (
        <div className="flex justify-center gap-1.5 mt-3">
          {boxes.map((box, i) => (
            <button
              key={box._id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-brand-primary' : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
