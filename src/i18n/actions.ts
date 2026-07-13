'use server'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE, type Locale } from './config'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })

  const session = await auth()
  if (session?.user?.id) {
    await connectDB()
    await User.findByIdAndUpdate(session.user.id, { language: locale })
  }
}
