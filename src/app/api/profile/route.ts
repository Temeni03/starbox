import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { deleteBlob } from '@/lib/blob'

const ProfileSchema = z
  .object({
    name: z.string().min(2).max(100).trim().optional(),
    phone: z.string().regex(/^[234][0-9]{7}$/, 'Phone must be 8 digits starting with 2, 3 or 4').optional(),
    language: z.enum(['ar', 'fr', 'en']).optional(),
    profilePhoto: z.string().url().nullable().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: 'Current password is required to set a new password',
    path: ['currentPassword'],
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

  let hashedPassword: string | undefined
  if (parsed.data.newPassword) {
    const user = await User.findById(session.user.id).select('password')
    const valid = user && (await bcrypt.compare(parsed.data.currentPassword!, user.password))
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
    hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12)
  }

  const update: Record<string, unknown> = {}
  if (parsed.data.name) update.name = parsed.data.name
  if (parsed.data.phone) update.phone = parsed.data.phone
  if (parsed.data.language) update.language = parsed.data.language
  if (parsed.data.profilePhoto !== undefined) update.profilePhoto = parsed.data.profilePhoto
  if (hashedPassword) update.password = hashedPassword

  const previous = parsed.data.profilePhoto !== undefined
    ? await User.findById(session.user.id).select('profilePhoto').lean()
    : null

  await User.findByIdAndUpdate(session.user.id, update)

  if (previous?.profilePhoto && previous.profilePhoto !== parsed.data.profilePhoto) {
    await deleteBlob(previous.profilePhoto)
  }

  return NextResponse.json({ success: true })
}
