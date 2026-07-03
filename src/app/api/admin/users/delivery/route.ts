import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

const DeliverySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  phone: z.string().regex(/^[234][0-9]{7}$/, 'Phone must be 8 digits starting with 2, 3 or 4'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = DeliverySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  await connectDB()

  const existing = await User.findOne({ phone: parsed.data.phone })
  if (existing) {
    return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  const user = await User.create({
    name: parsed.data.name,
    phone: parsed.data.phone,
    password: hashed,
    role: 'delivery',
  })

  return NextResponse.json({ success: true, userId: user._id }, { status: 201 })
}
