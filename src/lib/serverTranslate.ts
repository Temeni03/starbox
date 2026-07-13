import { createTranslator } from 'use-intl'
import type { Locale } from '@/i18n/config'

async function getMessages(locale: Locale) {
  return (await import(`../messages/${locale}.json`)).default
}

/**
 * Translates a message from the app's messages/*.json files for an arbitrary
 * locale outside of React/request scope (e.g. when generating notification
 * text server-side for a specific recipient). Reuses the same message source
 * as the client-side next-intl provider.
 */
export async function translate(
  locale: Locale,
  namespace: string,
  key: string,
  values?: Record<string, string | number>
): Promise<string> {
  const messages = await getMessages(locale)
  const t = createTranslator({ locale, messages, namespace })
  return t(key, values)
}
