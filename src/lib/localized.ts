import { cookies } from 'next/headers'
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from '@/i18n/config'

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  return locales.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : defaultLocale
}

export { resolveLocalized } from './resolveLocalized'
