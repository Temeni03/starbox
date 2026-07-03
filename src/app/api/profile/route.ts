import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

const ProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().regex(/^[234][0-9]{7}$/, 'Phone must be 8 digits starting with 2, 3 or 4').optional(),
  language: z.enum(['ar', 'fr', 'en']).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id).select('profilePhoto language').lean()
  return NextResponse.json({
    profilePhoto: user?.profilePhoto ?? null,
    language: user?.language ?? 'fr',
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()

  if (parsed.data.phone) {
    const existing = await User.findOne({ phone: parsed.data.phone, _id: { $ne: session.user.id } })
    if (existing) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
    }
  }

  const update: Record<string, unknown> = {}
  if (parsed.data.name) update.name = parsed.data.name
  if (parsed.data.phone) update.phone = parsed.data.phone
  if (parsed.data.language) update.language = parsed.data.language

  await User.findByIdAndUpdate(session.user.id, update)
  return NextResponse.json({ success: true })
}
