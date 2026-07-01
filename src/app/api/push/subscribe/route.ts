import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await req.json()
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, {
    pushSubscription: {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, { $unset: { pushSubscription: 1 } })
  return NextResponse.json({ success: true })
}
