'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import {
  addDays,
  addMonths,
  buildMonthGrid,
  isSameDay,
  isSameMonth,
  latnLocale,
  parseISODate,
  startOfDay,
  startOfMonth,
  toISODate,
  weekStartsOn,
} from '@/lib/date'

interface DatePickerProps {
  /** `YYYY-MM-DD`, or '' for empty — the same value shape `<input type="date">` produced. */
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  /** Inclusive bounds, `YYYY-MM-DD`. Days outside are shown but not selectable. */
  min?: string
  max?: string
  id?: string
  name?: string
  disabled?: boolean
  /** Shows an inline clear button once a date is picked. Defaults to true. */
  clearable?: boolean
  className?: string
}

/**
 * App date picker: a calendar popover on tablet/desktop and a bottom sheet on phones, replacing
 * `<input type="date">` so the control looks the same in every browser and follows the app's
 * brand colours, typography, locale (ar/fr/en month names) and text direction.
 *
 * The trigger reuses the exact field styling used elsewhere in the app (h-12, rounded-xl,
 * neutral-200 border, brand-primary focus ring), so forms keep their existing rhythm.
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  min,
  max,
  id,
  name,
  disabled = false,
  clearable = true,
  className = '',
}: DatePickerProps) {
  const t = useTranslations('datePicker')
  const locale = useLocale()
  const intlLocale = latnLocale(locale)

  const selected = parseISODate(value)
  const minDate = parseISODate(min)
  const maxDate = parseISODate(max)
  const today = useMemo(() => startOfDay(new Date()), [])

  const [open, setOpen] = useState(false)
  // Phones get a bottom sheet, larger screens an anchored popover.
  const [isSheet, setIsSheet] = useState(false)
  const [showMonthList, setShowMonthList] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selected ?? today))
  // Roving focus target for keyboard navigation inside the day grid.
  const [focusedDate, setFocusedDate] = useState(() => selected ?? today)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { day: 'numeric' }),
    [intlLocale]
  )
  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }),
    [intlLocale]
  )
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { month: 'short' }),
    [intlLocale]
  )
  const triggerFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { day: '2-digit', month: 'long', year: 'numeric' }),
    [intlLocale]
  )
  const fullDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [intlLocale]
  )

  const firstWeekday = weekStartsOn(locale)

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: 'narrow' })
    // 2024-01-07 was a Sunday, so adding the weekday index lands on that weekday.
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2024, 0, 7 + ((firstWeekday + i) % 7)))
    )
  }, [intlLocale, firstWeekday])

  const days = useMemo(
    () => buildMonthGrid(visibleMonth, firstWeekday),
    [visibleMonth, firstWeekday]
  )

  const isDisabledDay = useCallback(
    (day: Date) => (minDate != null && day < minDate) || (maxDate != null && day > maxDate),
    [minDate, maxDate]
  )

  const close = useCallback((refocus = true) => {
    setOpen(false)
    setShowMonthList(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  function openPicker() {
    if (disabled) return
    const anchor = selected ?? today
    setVisibleMonth(startOfMonth(anchor))
    setFocusedDate(anchor)
    setShowMonthList(false)
    setOpen(true)
  }

  function select(day: Date) {
    if (isDisabledDay(day)) return
    onChange(toISODate(day))
    close()
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  // `sm` in this project is 40rem; matching it in JS keeps the sheet/popover switch in step with
  // the Tailwind breakpoint used everywhere else.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 40rem)')
    const update = () => setIsSheet(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Close on outside pointer press. Listening on the document keeps the sheet's backdrop and the
  // desktop click-away on a single code path.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  // Keep DOM focus on the roving day so arrow keys read naturally to screen readers.
  useEffect(() => {
    if (!open || showMonthList) return
    panelRef.current
      ?.querySelector<HTMLButtonElement>(`[data-iso="${toISODate(focusedDate)}"]`)
      ?.focus()
  }, [open, showMonthList, focusedDate])

  function onGridKeyDown(e: React.KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    // Horizontal arrows are mirrored in RTL, so "left" always means the day drawn to the left.
    const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl'
    let next: Date | null = null

    if (e.key in moves) {
      const step = moves[e.key]
      next = addDays(focusedDate, rtl && Math.abs(step) === 1 ? -step : step)
    } else if (e.key === 'PageUp') next = addMonths(focusedDate, -1)
    else if (e.key === 'PageDown') next = addMonths(focusedDate, 1)
    else if (e.key === 'Home') next = addDays(focusedDate, -focusedDate.getDay())
    else if (e.key === 'End') next = addDays(focusedDate, 6 - focusedDate.getDay())
    else return

    e.preventDefault()
    setFocusedDate(next)
    if (!isSameMonth(next, visibleMonth)) setVisibleMonth(startOfMonth(next))
  }

  const triggerLabel = selected ? triggerFormatter.format(selected) : (placeholder ?? t('placeholder'))

  /**
   * A `backdrop-filter` or `transform` ancestor makes `position: fixed` resolve against THAT
   * element instead of the viewport — and the admin cards this picker sits in are all
   * `backdrop-blur`, which pinned the phone sheet inside the card (measured at top: -112px).
   * The sheet is therefore portalled onto <body>, where nothing can capture it. The desktop
   * popover stays where it is: `absolute` against the local `relative` wrapper is unaffected.
   */
  function renderPanel(panel: React.ReactNode) {
    if (!isSheet) return panel
    return createPortal(
      <>
        <div className="fixed inset-0 z-50 bg-neutral-900/40" aria-hidden="true" />
        {panel}
      </>,
      document.body
    )
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-label-sm text-neutral-500 mb-1">
          {label}
        </label>
      )}

      {/* Keeps the value readable/submittable by anything inspecting the form, like the native
          input it replaces. */}
      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.preventDefault()
            close()
          }
        }}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full h-12 px-4 flex items-center gap-2 border rounded-xl text-body-md text-start bg-white transition focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed ${
          open ? 'border-transparent ring-2 ring-brand-primary' : 'border-neutral-200'
        }`}
      >
        <span className="text-neutral-400 flex items-center shrink-0">
          <Icon name="calendar_month" size={18} />
        </span>
        <span
          className={`flex-1 min-w-0 truncate ${selected ? 'text-neutral-800' : 'text-neutral-400'}`}
        >
          {triggerLabel}
        </span>
        {clearable && selected && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label={t('clear')}
            title={t('clear')}
            onClick={clear}
            className="shrink-0 flex items-center text-neutral-400 hover:text-danger transition"
          >
            <Icon name="close" size={16} />
          </span>
        )}
      </button>

      {open && renderPanel(
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              close()
            }
          }}
          className={`z-50 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 ${
            isSheet
              ? 'fixed inset-x-3 bottom-3 mx-auto w-auto max-w-[22rem]'
              : 'absolute top-full mt-2 start-0 w-80'
          }`}
        >
          {/* Month / year header */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <button
              type="button"
              onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
              aria-label={t('previousMonth')}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-neutral-500 hover:bg-surface-low transition"
            >
              <Icon name="chevron_left" size={20} className="rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setShowMonthList((v) => !v)}
              aria-label={t('chooseMonth')}
              className="flex-1 min-w-0 h-9 px-2 flex items-center justify-center gap-1 rounded-xl text-label-lg text-neutral-800 hover:bg-surface-low transition"
            >
              <span className="truncate capitalize">{monthYearFormatter.format(visibleMonth)}</span>
              <Icon
                name={showMonthList ? 'expand_less' : 'expand_more'}
                size={18}
                className="text-neutral-400"
              />
            </button>

            <button
              type="button"
              onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
              aria-label={t('nextMonth')}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-neutral-500 hover:bg-surface-low transition"
            >
              <Icon name="chevron_right" size={20} className="rtl:rotate-180" />
            </button>
          </div>

          {showMonthList ? (
            /* Month + year view — one tap to jump a year instead of paging month by month. */
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((m) => addMonths(m, -12))}
                  aria-label={t('previousYear')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-surface-low transition"
                >
                  <Icon name="chevron_left" size={20} className="rtl:rotate-180" />
                </button>
                <span className="text-label-lg text-neutral-800">{visibleMonth.getFullYear()}</span>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((m) => addMonths(m, 12))}
                  aria-label={t('nextYear')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-surface-low transition"
                >
                  <Icon name="chevron_right" size={20} className="rtl:rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 12 }, (_, monthIndex) => {
                  const monthDate = new Date(visibleMonth.getFullYear(), monthIndex, 1)
                  const active = monthIndex === visibleMonth.getMonth()
                  return (
                    <button
                      key={monthIndex}
                      type="button"
                      onClick={() => {
                        setVisibleMonth(monthDate)
                        setShowMonthList(false)
                      }}
                      className={`h-10 rounded-xl text-body-md capitalize transition ${
                        active
                          ? 'bg-brand-primary text-white font-semibold'
                          : 'text-neutral-600 hover:bg-surface-low'
                      }`}
                    >
                      {monthFormatter.format(monthDate)}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {weekdayLabels.map((day, i) => (
                  <span
                    key={i}
                    className="h-8 flex items-center justify-center text-label-sm text-neutral-400"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div role="grid" className="grid grid-cols-7 gap-0.5" onKeyDown={onGridKeyDown}>
                {days.map((day) => {
                  const iso = toISODate(day)
                  const outside = !isSameMonth(day, visibleMonth)
                  const isSelected = selected != null && isSameDay(day, selected)
                  const isToday = isSameDay(day, today)
                  const dayDisabled = isDisabledDay(day)

                  return (
                    <button
                      key={iso}
                      type="button"
                      data-iso={iso}
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={fullDateFormatter.format(day)}
                      disabled={dayDisabled}
                      tabIndex={isSameDay(day, focusedDate) ? 0 : -1}
                      onClick={() => select(day)}
                      onFocus={() => setFocusedDate(day)}
                      className={`h-10 rounded-xl text-body-md transition focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-30 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-brand-primary text-white font-semibold shadow-sm'
                          : isToday
                            ? 'text-brand-primary font-semibold bg-brand-light/60 hover:bg-brand-container/40'
                            : outside
                              ? 'text-neutral-300 hover:bg-surface-low'
                              : 'text-neutral-700 hover:bg-surface-low'
                      }`}
                    >
                      {dayFormatter.format(day)}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                if (isDisabledDay(today)) return
                setVisibleMonth(startOfMonth(today))
                setFocusedDate(today)
                select(today)
              }}
              disabled={isDisabledDay(today)}
              className="px-3 h-9 rounded-xl text-label-lg text-brand-primary hover:bg-brand-light/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('today')}
            </button>
            <div className="flex items-center gap-1">
              {clearable && selected && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    close()
                  }}
                  className="px-3 h-9 rounded-xl text-label-lg text-neutral-500 hover:bg-surface-low transition"
                >
                  {t('clear')}
                </button>
              )}
              <button
                type="button"
                onClick={() => close()}
                className="px-4 h-9 rounded-xl text-label-lg text-white bg-brand-primary hover:bg-brand-secondary transition"
              >
                {t('done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
