import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Notification, type NotificationType } from '@/models/Notification'
import { sendPushToUser, sendPushToRole } from '@/lib/webpush'

export interface NotifyPayload {
  type: NotificationType
  title: string
  body: string
  url?: string
}

export async function notifyUser(userId: string, payload: NotifyPayload) {
  await connectDB()
  await Notification.create({ user: userId, ...payload })
  sendPushToUser(userId, payload).catch(() => {})
}

export async function notifyRole(role: 'admin' | 'delivery', payload: NotifyPayload, excludeUserId?: string) {
  await connectDB()
  const filter: Record<string, unknown> = { role, isActive: true }
  if (excludeUserId) filter._id = { $ne: excludeUserId }
  const users = await User.find(filter).select('_id').lean()
  if (users.length === 0) return
  await Notification.insertMany(users.map((u) => ({ user: u._id, ...payload })))
  sendPushToRole(role, payload, excludeUserId).catch(() => {})
}
