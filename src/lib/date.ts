/**
 * Calendar-date helpers shared by the DatePicker and anything that stores a plain day.
 *
 * Dates are exchanged as `YYYY-MM-DD` strings — the same format `<input type="date">` used, so
 * existing forms, API payloads and stored documents keep working unchanged. All parsing and
 * formatting happens in LOCAL time on purpose: `new Date('2026-08-19')` is parsed as UTC
 * midnight by the spec, which renders as the previous day for anyone behind UTC.
 */

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** `Date` -> `YYYY-MM-DD`, using the local calendar day. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** `YYYY-MM-DD` -> local `Date` at midnight, or null when absent/malformed. */
export function parseISODate(value?: string | null): Date | null {
  if (!value || !ISO_DATE_RE.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  // Rejects impossible days like 2026-02-31, which JS would silently roll over.
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  return target
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * First weekday of the week per locale: Saturday for Arabic (Mauritania and the wider region),
 * Monday for French, Sunday for English. `Intl.Locale.getWeekInfo()` would give this natively but
 * is still missing in Firefox and older Safari, so a small table keeps the grid stable everywhere.
 */
export function weekStartsOn(locale: string): number {
  if (locale.startsWith('ar')) return 6
  if (locale.startsWith('en')) return 0
  return 1
}

/**
 * The 42 days (6 weeks) drawn for a month view, starting on the locale's first weekday. A fixed
 * 6-week grid keeps the popover from resizing as the user pages through months.
 */
export function buildMonthGrid(month: Date, firstWeekday: number): Date[] {
  const first = startOfMonth(month)
  const lead = (first.getDay() - firstWeekday + 7) % 7
  const start = addDays(first, -lead)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Latin digits everywhere: prices, phone numbers and stock counts in this app are all Latin. */
export function latnLocale(locale: string): string {
  return `${locale}-u-nu-latn`
}

/**
 * Turns inclusive `YYYY-MM-DD` bounds into a Mongo range on a timestamp field, or null when
 * neither bound is usable. Boundaries are taken at UTC midnight: the app's market (Mauritania)
 * is UTC+0 year-round, so a UTC day and a local day are the same 24 hours, and pinning to UTC
 * keeps the result identical no matter which region the server happens to run in.
 */
export function isoDayRangeFilter(
  from?: string | null,
  to?: string | null
): { $gte?: Date; $lte?: Date } | null {
  const range: { $gte?: Date; $lte?: Date } = {}
  // parseISODate (not just the regex) so calendar-impossible values from a hand-edited query
  // string — `2026-13-45`, `2026-02-31` — are dropped instead of reaching the driver as an
  // Invalid Date, which Mongoose rejects with a CastError.
  if (parseISODate(from)) range.$gte = new Date(`${from}T00:00:00.000Z`)
  if (parseISODate(to)) range.$lte = new Date(`${to}T23:59:59.999Z`)
  return range.$gte || range.$lte ? range : null
}
