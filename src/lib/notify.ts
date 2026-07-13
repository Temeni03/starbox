import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Notification, type NotificationType } from '@/models/Notification'
import { sendPushToUser, sendPushToUsers } from '@/lib/webpush'
import { translate } from '@/lib/serverTranslate'
import { resolveNotificationParams, type NotificationParams } from '@/lib/notificationParams'
import { defaultLocale, type Locale } from '@/i18n/config'

export interface NotifyPayload {
  type: NotificationType
  params?: NotificationParams
  url?: string
}

async function renderText(type: NotificationType, locale: Locale, params?: NotificationParams) {
  const values = resolveNotificationParams(params, locale)
  const [title, body] = await Promise.all([
    translate(locale, 'notifications.types', `${type}.title`),
    translate(locale, 'notifications.types', `${type}.body`, values),
  ])
  return { title, body }
}

export async function notifyUser(userId: string, payload: NotifyPayload) {
  await connectDB()
  const user = await User.findById(userId).select('language').lean()
  const locale = (user?.language as Locale) ?? defaultLocale
  const { title, body } = await renderText(payload.type, locale, payload.params)

  await Notification.create({
    user: userId,
    type: payload.type,
    title,
    body,
    data: payload.params,
    url: payload.url,
  })
  sendPushToUser(userId, { title, body, url: payload.url }).catch(() => {})
}

export async function notifyRole(role: 'admin' | 'delivery', payload: NotifyPayload, excludeUserId?: string) {
  await connectDB()
  const filter: Record<string, unknown> = { role, isActive: true }
  if (excludeUserId) filter._id = { $ne: excludeUserId }
  const users = await User.find(filter).select('_id language').lean()
  if (users.length === 0) return

  const docs = await Promise.all(
    users.map(async (u) => {
      const locale = (u.language as Locale) ?? defaultLocale
      const { title, body } = await renderText(payload.type, locale, payload.params)
      return { user: u._id, type: payload.type, title, body, data: payload.params, url: payload.url }
    })
  )

  await Notification.insertMany(docs)
  sendPushToUsers(
    docs.map((d) => ({ userId: d.user.toString(), payload: { title: d.title, body: d.body, url: d.url } }))
  ).catch(() => {})
}
