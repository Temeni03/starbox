import webpush from 'web-push'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

let initialized = false

function init() {
  if (initialized) return
  const { VAPID_EMAIL, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env
  if (!VAPID_EMAIL || !NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return
  webpush.setVapidDetails(VAPID_EMAIL, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  initialized = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  init()
  if (!initialized) return

  await connectDB()
  const user = await User.findById(userId).select('pushSubscription').lean()
  const sub = (user as any)?.pushSubscription
  if (!sub?.endpoint) return

  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
      JSON.stringify(payload)
    )
  } catch (err: any) {
    if (err.statusCode === 410) {
      // Subscription expired — remove it
      await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } })
    }
  }
}

export async function sendPushToRole(role: 'admin' | 'delivery', payload: PushPayload, excludeUserId?: string) {
  init()
  if (!initialized) return

  await connectDB()
  const filter: Record<string, unknown> = { role, isActive: true, 'pushSubscription.endpoint': { $exists: true } }
  if (excludeUserId) filter._id = { $ne: excludeUserId }
  const users = await User.find(filter)
    .select('pushSubscription')
    .lean()

  await Promise.allSettled(
    users.map((u) => {
      const sub = (u as any).pushSubscription
      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        JSON.stringify(payload)
      )
    })
  )
}
