import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

const RegisterSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  phone: z
    .string()
    .regex(/^[0-9]{9,15}$/, 'Phone must be 9–15 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, phone, password } = parsed.data

    await connectDB()

    const existing = await User.findOne({ phone })
    if (existing) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    await User.create({ name, phone, password: hashed, role: 'customer' })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
