'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
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
      <div className="mb-8 relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] shadow-[0_20px_45px_-15px_rgba(151,49,185,0.3)] motion-safe:animate-[premium-in_0.9s_ease-out]">
        {/* Soft pastel brand gradient — light tints bookended for gentle richness */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-light via-brand-container to-brand-light bg-[length:200%_200%] motion-safe:animate-[gradient-pan_16s_ease-in-out_infinite]" />
        {/* Gentle grounding + highlight for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(107,31,132,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_15%,rgba(255,255,255,0.65),transparent_55%)]" />
        {/* Top glass sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/50 to-transparent pointer-events-none" />

        {/* Floating ambient glow orbs */}
        <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/60 blur-3xl motion-safe:animate-[float-slow_9s_ease-in-out_infinite]" />
        <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-brand-container/50 blur-3xl motion-safe:animate-[float-slow_11s_ease-in-out_infinite_2s]" />

        {/* Slow diagonal sheen sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent motion-safe:animate-[sheen-sweep_9s_ease-in-out_infinite]" />
        </div>

        {/* Frosted glass content card — sized to fit fully within the fixed bar and vertically centered */}
        <div className="relative h-full flex items-center justify-center px-6 sm:px-10">
          <div className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_8px_32px_rgba(107,31,132,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] px-5 py-4 sm:px-8 sm:py-6 flex flex-col items-center text-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-container/60 bg-brand-container/25 px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.15em] text-danger backdrop-blur-md mb-2 sm:mb-3 motion-safe:animate-pulse">
              <Icon name="local_fire_department" size={11} weight={600} className="text-danger" />
              {t.rich('comingSoonBadge', {
                soon: (chunks) => <span className="text-danger">{chunks}</span>,
              })}
            </span>

            {/* Central sparkle — visual storytelling in place of a static icon */}
            <div className="relative w-14 h-9 sm:w-16 sm:h-10 mb-2 sm:mb-3">
              <div className="absolute inset-0 rounded-full bg-brand-container/40 blur-xl motion-safe:animate-pulse" />
              <Icon
                name="auto_awesome"
                size={20}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-secondary motion-safe:animate-pulse"
              />
            </div>

            <h3 className="text-body-lg sm:text-headline-md tracking-tight font-semibold text-brand-secondary mb-1 sm:mb-1.5 text-center [font-family:var(--font-heading)]">
              {t('noOffersTitle')}
            </h3>

            <div className="h-px w-12 bg-linear-to-r from-transparent via-brand-primary/40 to-transparent mb-1.5 sm:mb-2" />

            <p className="text-label-sm sm:text-body-md text-neutral-600 leading-relaxed tracking-wide text-center max-w-xs">
              {t('noOffersDesc')}
            </p>
          </div>
        </div>
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
                <Icon name="card_giftcard" size={40} className="relative text-white/80 transition-transform duration-700 group-hover:scale-110" />
              </div>
            )}

            {/* Depth gradients for legibility */}
            <div className="absolute inset-0 bg-linear-to-r from-brand-secondary/35 via-brand-secondary/10 via-40% to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-brand-secondary/25 via-transparent via-45% to-transparent" />

            {/* Subtle top sheen */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center gap-2.5 sm:gap-3.5 px-5 sm:px-10 max-w-[80%] sm:max-w-[60%]">
              <span className="inline-flex w-fit items-center rounded-full border border-amber-200/40 bg-white/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-amber-200 backdrop-blur-md">
                {t('specialOffer')}
              </span>

              <h3 className="text-[22px] sm:text-[34px] leading-[1.15] font-extrabold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] line-clamp-2 [font-family:var(--font-heading)]">
                {box.name}
              </h3>

              <div className="flex items-center gap-3 mt-1">
                <span className="rounded-full bg-linear-to-br from-white/[0.15] to-white/[0.22] backdrop-blur-[16px] border border-white/20 px-4 py-2 sm:px-5 sm:py-2.5 text-[20px] sm:text-[28px] font-semibold tracking-tight text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] [font-family:var(--font-heading)]">
                  {box.price.toLocaleString()}
                  <span className="ms-1 text-[11px] sm:text-[14px] font-medium tracking-wide text-white/80 align-middle">MRU</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-label-lg text-white/95">
                  {t('shopNow')}
                  <Icon
                    name="chevron_right"
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
            <Icon name="chevron_left" size={20} className="rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('nextSlide')}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-md shadow-lg transition-all duration-300 group-hover/carousel:opacity-100 hover:bg-white/35 active:scale-90"
          >
            <Icon name="chevron_right" size={20} className="rtl:rotate-180" />
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
