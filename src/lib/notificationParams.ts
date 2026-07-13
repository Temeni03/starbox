import { resolveLocalized } from '@/lib/resolveLocalized'
import type { Locale } from '@/i18n/config'
import type { LocalizedText } from '@/types/localized'

export type NotificationParams = Record<string, string | number | LocalizedText | undefined>

function isLocalizedText(value: unknown): value is LocalizedText {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Resolves stored notification params (which may carry raw LocalizedText objects,
 * e.g. a product name) into plain ICU message values for the given locale, and
 * derives the `hasReason` select flag used by the order_cancelled template.
 */
export function resolveNotificationParams(
  params: NotificationParams | undefined,
  locale: Locale
): Record<string, string | number> {
  const resolved: Record<string, string | number> = {}
  if (!params) return resolved
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    resolved[key] = isLocalizedText(value) ? resolveLocalized(value, locale) : value
  }
  resolved.hasReason = 'reason' in resolved ? 'true' : 'false'
  return resolved
}
