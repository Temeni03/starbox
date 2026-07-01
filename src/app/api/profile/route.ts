import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

const ProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  address: z.string().trim().optional(),
  profilePhoto: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()

  const update: Record<string, unknown> = {}
  if (parsed.data.name) update.name = parsed.data.name
  if (parsed.data.address !== undefined) update.address = parsed.data.address
  if (parsed.data.profilePhoto !== undefined) update.profilePhoto = parsed.data.profilePhoto

  await User.findByIdAndUpdate(session.user.id, update)
  return NextResponse.json({ success: true })
}
