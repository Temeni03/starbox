import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { getAdminMessaging } from '@/lib/firebase-admin'

export interface PushPayload {
  title: string
  body: string
  url?: string
}

// Codes FCM returns when a token is no longer valid (app uninstalled, permission
// revoked, token rotated) — safe to drop from the user record when seen.
const STALE_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
])

function isStaleTokenError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && STALE_TOKEN_CODES.has((err as { code: unknown }).code as string)
}

function toMessage(token: string, payload: PushPayload) {
  return {
    token,
    // Data-only payload: the service worker's onBackgroundMessage builds and shows
    // the notification itself, and the foreground listener shows a toast instead —
    // sending a `notification` key here would make the browser show its own
    // OS notification on top of both, double-notifying the user.
    data: {
      title: payload.title,
      body: payload.body,
      ...(payload.url ? { url: payload.url } : {}),
    },
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const messaging = getAdminMessaging()
  if (!messaging) return

  await connectDB()
  const user = await User.findById(userId).select('fcmToken').lean<{ fcmToken?: string }>()
  const token = user?.fcmToken
  if (!token) return

  try {
    await messaging.send(toMessage(token, payload))
  } catch (err: unknown) {
    if (isStaleTokenError(err)) {
      await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } })
    }
  }
}

export async function sendPushToUsers(items: { userId: string; payload: PushPayload }[]) {
  const messaging = getAdminMessaging()
  if (!messaging || items.length === 0) return

  await connectDB()
  const users = await User.find({
    _id: { $in: items.map((i) => i.userId) },
    fcmToken: { $exists: true, $ne: null },
  })
    .select('fcmToken')
    .lean<{ _id: { toString(): string }; fcmToken: string }[]>()
  const tokenById = new Map(users.map((u) => [u._id.toString(), u.fcmToken]))

  const staleUserIds: string[] = []
  await Promise.allSettled(
    items.map(async ({ userId, payload }) => {
      const token = tokenById.get(userId)
      if (!token) return
      try {
        await messaging.send(toMessage(token, payload))
      } catch (err: unknown) {
        if (isStaleTokenError(err)) staleUserIds.push(userId)
      }
    })
  )

  if (staleUserIds.length > 0) {
    await User.updateMany({ _id: { $in: staleUserIds } }, { $unset: { fcmToken: 1 } })
  }
}
