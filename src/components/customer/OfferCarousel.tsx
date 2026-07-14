'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react'
import { useBoxes } from '@/hooks/useBoxes'

const AUTOPLAY_INTERVAL = 5500

export function OfferCarousel() {
  const t = useTranslations('home')
  const { boxes, isLoading } = useBoxes()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
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

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current
    const slide = track?.children[i] as HTMLElement | undefined
    if (!track || !slide) return
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  // Autoplay — pauses on hover/touch/manual interaction
  useEffect(() => {
    if (!showPeek || isPaused) return
    const id = setInterval(() => {
      const next = (activeIndex + 1) % boxes.length
      scrollToIndex(next)
    }, AUTOPLAY_INTERVAL)
    return () => clearInterval(id)
  }, [showPeek, isPaused, activeIndex, boxes.length, scrollToIndex])

  function goPrev() {
    scrollToIndex((activeIndex - 1 + boxes.length) % boxes.length)
  }
  function goNext() {
    scrollToIndex((activeIndex + 1) % boxes.length)
  }

  if (isLoading) {
    return (
      <div className="mb-8 rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-linear-to-br from-surface-high via-surface-low to-surface-high bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
    )
  }

  if (boxes.length === 0) {
    return (
      <div className="mb-8 relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container shadow-[0_20px_45px_-15px_rgba(151,49,185,0.45)] flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        <Gift size={40} className="relative text-white/70" />
      </div>
    )
  }

  return (
    <div
      className="relative mb-8 group/carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          showPeek ? 'px-[4%]' : ''
        }`}
      >
        {boxes.map((box, i) => (
          <Link
            key={box._id}
            href={`/offers/${box._id}`}
            className={`group relative shrink-0 snap-center aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-linear-to-br from-brand-secondary via-brand-primary to-brand-container shadow-[0_20px_45px_-15px_rgba(151,49,185,0.45)] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-[0_25px_55px_-12px_rgba(151,49,185,0.55)] ${
              showPeek ? 'w-[92%]' : 'w-full'
            }`}
          >
            {/* Image / fallback */}
            {box.coverImage ? (
              <Image
                src={box.coverImage}
                alt={box.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                sizes="92vw"
                priority={i === 0}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_55%)]" />
                <Gift size={40} className="relative text-white/80 transition-transform duration-700 group-hover:scale-110" />
              </div>
            )}

            {/* Depth gradients for legibility */}
            <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10" />

            {/* Subtle top sheen */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center gap-2.5 sm:gap-3.5 px-5 sm:px-10 max-w-[80%] sm:max-w-[60%]">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles size={14} className="text-white/90" />
                {t('specialOffer')}
              </span>

              <h3 className="text-xl sm:text-3xl font-bold text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] line-clamp-2">
                {box.name}
              </h3>

              <div className="flex items-center gap-3 mt-1">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-bold text-brand-secondary shadow-sm backdrop-blur-sm">
                  {box.price.toLocaleString()} MRU
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/95">
                  {t('shopNow')}
                  <ChevronRight
                    size={16}
                    className="rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showPeek && (
        <>
          {/* Prev / Next controls — desktop only, revealed on hover */}
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('previousSlide')}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-md shadow-lg transition-all duration-300 group-hover/carousel:opacity-100 hover:bg-white/35 active:scale-90"
          >
            <ChevronLeft size={20} className="rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('nextSlide')}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-md shadow-lg transition-all duration-300 group-hover/carousel:opacity-100 hover:bg-white/35 active:scale-90"
          >
            <ChevronRight size={20} className="rtl:rotate-180" />
          </button>

          {/* Pagination */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 sm:bottom-5 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1.5 backdrop-blur-md">
              {boxes.map((box, i) => (
                <button
                  key={box._id}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={t('goToSlide', { index: i + 1 })}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : 'w-1.5 bg-white/45 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
