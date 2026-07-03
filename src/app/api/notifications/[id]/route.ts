import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: session.user.id },
    { $set: { read: true } },
    { new: true }
  )
  if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

  return NextResponse.json({ notification })
}
