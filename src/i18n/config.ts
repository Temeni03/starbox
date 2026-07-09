export const locales = ['ar', 'fr', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ar'

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  fr: 'Français',
  en: 'English',
}

export const rtlLocales: Locale[] = ['ar']

export function isRtl(locale: Locale) {
  return rtlLocales.includes(locale)
}

export const LOCALE_COOKIE = 'NEXT_LOCALE'
