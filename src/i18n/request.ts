import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const locale: Locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
