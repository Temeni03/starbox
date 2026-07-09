import { locales, type Locale } from '@/i18n/config'
import type { LocalizedText } from '@/types/localized'

export function resolveLocalized(text: LocalizedText | undefined | null, locale: Locale): string {
  if (!text) return ''
  const order: Locale[] = [locale, ...locales.filter((l) => l !== locale)]
  for (const l of order) {
    const value = text[l]
    if (value) return value
  }
  return ''
}
