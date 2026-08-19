import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

/**
 * Heartbeat from a signed-in client. Stamps `lastActiveAt` so the admin panel can tell who is
 * actually online right now, as opposed to who has an account. `timestamps: false` keeps the
 * ping from touching `updatedAt`, which tracks real profile edits.
 */
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await User.updateOne(
    { _id: session.user.id },
    { $set: { lastActiveAt: new Date() } },
    { timestamps: false }
  )

  return new NextResponse(null, { status: 204 })
}
