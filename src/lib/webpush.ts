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

export async function sendPushToUsers(items: { userId: string; payload: PushPayload }[]) {
  init()
  if (!initialized || items.length === 0) return

  await connectDB()
  const users = await User.find({
    _id: { $in: items.map((i) => i.userId) },
    'pushSubscription.endpoint': { $exists: true },
  })
    .select('pushSubscription')
    .lean()
  const subById = new Map(users.map((u) => [u._id.toString(), (u as any).pushSubscription]))

  await Promise.allSettled(
    items.map(({ userId, payload }) => {
      const sub = subById.get(userId)
      if (!sub?.endpoint) return Promise.resolve()
      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        JSON.stringify(payload)
      )
    })
  )
}
